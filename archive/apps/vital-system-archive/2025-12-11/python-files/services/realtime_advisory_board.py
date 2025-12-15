# ===================================================================
# Real-time Advisory Board Service - Phase 2 Enhanced
# Consensus algorithms, expert panel coordination, and decision support
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set, Tuple
from enum import Enum
import uuid
from dataclasses import dataclass, asdict, field
import numpy as np
import asyncpg
import redis.asyncio as redis
import socketio
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import opentelemetry.trace as trace
from opentelemetry import metrics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
advisory_sessions = meter.create_counter(
    "advisory_sessions_total",
    description="Total advisory board sessions"
)

consensus_reached = meter.create_counter(
    "consensus_reached_total",
    description="Total consensus decisions reached"
)

expert_participation = meter.create_gauge(
    "expert_participation_rate",
    description="Expert participation rate in sessions"
)

class ExpertRole(Enum):
    """Expert roles in advisory board"""
    CHIEF_MEDICAL_OFFICER = "chief_medical_officer"
    CLINICAL_SPECIALIST = "clinical_specialist"
    REGULATORY_EXPERT = "regulatory_expert"
    BIOSTATISTICIAN = "biostatistician"
    PATIENT_ADVOCATE = "patient_advocate"
    HEALTH_ECONOMIST = "health_economist"
    CLINICAL_RESEARCHER = "clinical_researcher"
    PHARMACOLOGIST = "pharmacologist"
    DATA_SCIENTIST = "data_scientist"
    QUALITY_ASSURANCE = "quality_assurance"
    MEDICAL_WRITER = "medical_writer"
    ETHICS_EXPERT = "ethics_expert"

class SessionType(Enum):
    """Types of advisory sessions"""
    CLINICAL_REVIEW = "clinical_review"
    REGULATORY_CONSULTATION = "regulatory_consultation"
    SAFETY_REVIEW = "safety_review"
    EFFICACY_ASSESSMENT = "efficacy_assessment"
    RISK_BENEFIT_ANALYSIS = "risk_benefit_analysis"
    PROTOCOL_REVIEW = "protocol_review"
    DATA_SAFETY_MONITORING = "data_safety_monitoring"
    ENDPOINT_ADJUDICATION = "endpoint_adjudication"
    STRATEGIC_PLANNING = "strategic_planning"
    EMERGENCY_REVIEW = "emergency_review"

class ConsensusAlgorithm(Enum):
    """Consensus building algorithms"""
    SIMPLE_MAJORITY = "simple_majority"
    WEIGHTED_VOTING = "weighted_voting"
    DELPHI_METHOD = "delphi_method"
    NOMINAL_GROUP = "nominal_group"
    CONSENSUS_THRESHOLD = "consensus_threshold"
    BAYESIAN_CONSENSUS = "bayesian_consensus"
    FUZZY_CONSENSUS = "fuzzy_consensus"
    EXPERT_WEIGHTED = "expert_weighted"

class DecisionType(Enum):
    """Types of decisions"""
    GO_NO_GO = "go_no_go"
    RISK_CLASSIFICATION = "risk_classification"
    DOSE_RECOMMENDATION = "dose_recommendation"
    ENDPOINT_SELECTION = "endpoint_selection"
    PROTOCOL_MODIFICATION = "protocol_modification"
    SAFETY_SIGNAL = "safety_signal"
    EFFICACY_CLAIM = "efficacy_claim"
    REGULATORY_STRATEGY = "regulatory_strategy"
    STUDY_CONTINUATION = "study_continuation"
    LABEL_RECOMMENDATION = "label_recommendation"

class SessionStatus(Enum):
    """Advisory session status"""
    SCHEDULED = "scheduled"
    IN_PREPARATION = "in_preparation"
    ACTIVE = "active"
    CONSENSUS_BUILDING = "consensus_building"
    UNDER_REVIEW = "under_review"
    COMPLETED = "completed"
    DEFERRED = "deferred"
    CANCELLED = "cancelled"

@dataclass
class ExpertProfile:
    """Expert advisory board member profile"""
    expert_id: str
    user_id: str
    name: str
    title: str
    role: ExpertRole
    organization: str
    specialty: str
    years_experience: int
    qualifications: List[str]
    board_certifications: List[str]
    research_areas: List[str]
    publication_count: int
    h_index: float
    expertise_domains: List[str]
    conflict_of_interest: Dict[str, Any]
    availability: Dict[str, Any]
    preferred_languages: List[str]
    timezone: str
    weight_factor: float = 1.0  # Expert weighting for consensus
    active: bool = True
    created_at: datetime = datetime.utcnow()

@dataclass
class DecisionItem:
    """Item for advisory board decision"""
    item_id: str
    title: str
    description: str
    decision_type: DecisionType
    options: List[str]
    supporting_data: Dict[str, Any]
    background_materials: List[str]
    regulatory_context: Optional[str] = None
    clinical_context: Optional[str] = None
    statistical_context: Optional[str] = None
    risk_factors: List[str] = field(default_factory=list)
    success_criteria: List[str] = field(default_factory=list)
    deadline: Optional[datetime] = None
    priority: str = "medium"
    created_at: datetime = datetime.utcnow()

@dataclass
class ExpertVote:
    """Expert vote on decision item"""
    vote_id: str
    expert_id: str
    item_id: str
    vote: str
    confidence: float  # 0.0 to 1.0
    rationale: str
    supporting_evidence: List[str]
    concerns: List[str]
    alternative_suggestions: List[str]
    weight: float = 1.0
    timestamp: datetime = datetime.utcnow()

@dataclass
class ConsensusResult:
    """Result of consensus building process"""
    item_id: str
    algorithm_used: ConsensusAlgorithm
    consensus_reached: bool
    final_decision: Optional[str]
    confidence_score: float
    agreement_percentage: float
    vote_distribution: Dict[str, int]
    weighted_scores: Dict[str, float]
    dissenting_opinions: List[Dict[str, Any]]
    convergence_metrics: Dict[str, float]
    statistical_significance: Optional[float]
    consensus_strength: str  # weak, moderate, strong
    decision_rationale: str
    recommendations: List[str]
    follow_up_actions: List[str]
    timestamp: datetime = datetime.utcnow()

@dataclass
class AdvisorySession:
    """Real-time advisory board session"""
    session_id: str
    title: str
    session_type: SessionType
    organization_id: str
    chair_id: str  # Session chair
    scheduled_start: datetime
    scheduled_end: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    status: SessionStatus = SessionStatus.SCHEDULED

    # Participants
    invited_experts: List[str]  # Expert IDs
    attending_experts: List[str] = field(default_factory=list)
    observers: List[str] = field(default_factory=list)

    # Content
    agenda: List[Dict[str, Any]] = field(default_factory=list)
    decision_items: List[DecisionItem] = field(default_factory=list)
    background_materials: List[str] = field(default_factory=list)
    supporting_documents: List[str] = field(default_factory=list)

    # Decisions and Consensus
    consensus_algorithm: ConsensusAlgorithm = ConsensusAlgorithm.WEIGHTED_VOTING
    consensus_threshold: float = 0.7
    votes: List[ExpertVote] = field(default_factory=list)
    consensus_results: List[ConsensusResult] = field(default_factory=list)

    # Session Management
    meeting_notes: str = ""
    action_items: List[Dict[str, Any]] = field(default_factory=list)
    follow_up_sessions: List[str] = field(default_factory=list)
    recordings: List[str] = field(default_factory=list)

    # Quality Metrics
    participation_rate: float = 0.0
    engagement_score: float = 0.0
    decision_quality_score: float = 0.0
    time_to_consensus: Dict[str, float] = field(default_factory=dict)

    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class ConsensusEngine:
    """Advanced consensus building engine"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.algorithms = {
            ConsensusAlgorithm.SIMPLE_MAJORITY: self._simple_majority,
            ConsensusAlgorithm.WEIGHTED_VOTING: self._weighted_voting,
            ConsensusAlgorithm.DELPHI_METHOD: self._delphi_method,
            ConsensusAlgorithm.NOMINAL_GROUP: self._nominal_group,
            ConsensusAlgorithm.CONSENSUS_THRESHOLD: self._consensus_threshold,
            ConsensusAlgorithm.BAYESIAN_CONSENSUS: self._bayesian_consensus,
            ConsensusAlgorithm.FUZZY_CONSENSUS: self._fuzzy_consensus,
            ConsensusAlgorithm.EXPERT_WEIGHTED: self._expert_weighted
        }

    async def build_consensus(self, decision_item: DecisionItem,
                            votes: List[ExpertVote],
                            experts: List[ExpertProfile],
                            algorithm: ConsensusAlgorithm,
                            threshold: float = 0.7) -> ConsensusResult:
        """Build consensus using specified algorithm"""
        with tracer.start_as_current_span("consensus_building") as span:
            span.set_attribute("algorithm", algorithm.value)
            span.set_attribute("item_id", decision_item.item_id)
            span.set_attribute("vote_count", len(votes))

            try:
                consensus_func = self.algorithms.get(algorithm)
                if not consensus_func:
                    raise ValueError(f"Unknown consensus algorithm: {algorithm}")

                result = await consensus_func(decision_item, votes, experts, threshold)

                if result.consensus_reached:
                    consensus_reached.add(1, {"algorithm": algorithm.value})

                return result

            except Exception as e:
                logger.error(f"Consensus building failed: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))

                return ConsensusResult(
                    item_id=decision_item.item_id,
                    algorithm_used=algorithm,
                    consensus_reached=False,
                    final_decision=None,
                    confidence_score=0.0,
                    agreement_percentage=0.0,
                    vote_distribution={},
                    weighted_scores={},
                    dissenting_opinions=[],
                    convergence_metrics={},
                    consensus_strength="none",
                    decision_rationale=f"Consensus building failed: {str(e)}",
                    recommendations=[],
                    follow_up_actions=[]
                )

    async def _simple_majority(self, item: DecisionItem, votes: List[ExpertVote],
                             experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Simple majority consensus"""
        if not votes:
            return self._empty_consensus_result(item, ConsensusAlgorithm.SIMPLE_MAJORITY)

        vote_counts = {}
        for vote in votes:
            option = vote.vote
            vote_counts[option] = vote_counts.get(option, 0) + 1

        total_votes = len(votes)
        vote_distribution = dict(vote_counts)

        # Find winning option
        winning_option = max(vote_counts, key=vote_counts.get)
        winning_votes = vote_counts[winning_option]
        agreement_percentage = (winning_votes / total_votes) * 100

        consensus_reached = agreement_percentage >= (threshold * 100)

        return ConsensusResult(
            item_id=item.item_id,
            algorithm_used=ConsensusAlgorithm.SIMPLE_MAJORITY,
            consensus_reached=consensus_reached,
            final_decision=winning_option if consensus_reached else None,
            confidence_score=agreement_percentage / 100,
            agreement_percentage=agreement_percentage,
            vote_distribution=vote_distribution,
            weighted_scores={option: count / total_votes for option, count in vote_counts.items()},
            dissenting_opinions=self._get_dissenting_opinions(votes, winning_option),
            convergence_metrics={"voting_rounds": 1},
            consensus_strength=self._calculate_consensus_strength(agreement_percentage),
            decision_rationale=f"Simple majority: {winning_option} ({agreement_percentage:.1f}%)",
            recommendations=[],
            follow_up_actions=[] if consensus_reached else ["Consider additional discussion"]
        )

    async def _weighted_voting(self, item: DecisionItem, votes: List[ExpertVote],
                             experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Weighted voting consensus based on expert weights"""
        if not votes:
            return self._empty_consensus_result(item, ConsensusAlgorithm.WEIGHTED_VOTING)

        # Create expert weight mapping
        expert_weights = {expert.expert_id: expert.weight_factor for expert in experts}

        # Calculate weighted votes
        weighted_counts = {}
        total_weight = 0
        vote_counts = {}

        for vote in votes:
            option = vote.vote
            weight = expert_weights.get(vote.expert_id, 1.0) * vote.confidence

            weighted_counts[option] = weighted_counts.get(option, 0) + weight
            vote_counts[option] = vote_counts.get(option, 0) + 1
            total_weight += weight

        if total_weight == 0:
            return self._empty_consensus_result(item, ConsensusAlgorithm.WEIGHTED_VOTING)

        # Calculate percentages
        weighted_percentages = {
            option: (weight / total_weight) * 100
            for option, weight in weighted_counts.items()
        }

        # Find winning option
        winning_option = max(weighted_percentages, key=weighted_percentages.get)
        winning_percentage = weighted_percentages[winning_option]

        consensus_reached = winning_percentage >= (threshold * 100)

        return ConsensusResult(
            item_id=item.item_id,
            algorithm_used=ConsensusAlgorithm.WEIGHTED_VOTING,
            consensus_reached=consensus_reached,
            final_decision=winning_option if consensus_reached else None,
            confidence_score=winning_percentage / 100,
            agreement_percentage=winning_percentage,
            vote_distribution=vote_counts,
            weighted_scores=weighted_percentages,
            dissenting_opinions=self._get_dissenting_opinions(votes, winning_option),
            convergence_metrics={"total_weight": total_weight, "voting_rounds": 1},
            consensus_strength=self._calculate_consensus_strength(winning_percentage),
            decision_rationale=f"Weighted consensus: {winning_option} ({winning_percentage:.1f}%)",
            recommendations=[],
            follow_up_actions=[] if consensus_reached else ["Consider expert consultation"]
        )

    async def _delphi_method(self, item: DecisionItem, votes: List[ExpertVote],
                           experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Delphi method consensus (iterative expert consultation)"""
        # Simplified Delphi implementation
        # In practice, this would involve multiple rounds of voting with feedback

        # For now, implement as enhanced weighted voting with convergence analysis
        initial_result = await self._weighted_voting(item, votes, experts, threshold)

        # Analyze convergence (simplified)
        convergence_score = self._calculate_convergence(votes)

        initial_result.algorithm_used = ConsensusAlgorithm.DELPHI_METHOD
        initial_result.convergence_metrics.update({
            "convergence_score": convergence_score,
            "rounds_needed": 1,
            "expert_agreement_variance": np.var([vote.confidence for vote in votes])
        })

        if convergence_score < 0.8 and not initial_result.consensus_reached:
            initial_result.follow_up_actions.append("Initiate additional Delphi rounds")

        return initial_result

    async def _nominal_group(self, item: DecisionItem, votes: List[ExpertVote],
                           experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Nominal Group Technique consensus"""
        # Simplified NGT implementation
        # Would typically involve structured idea generation and ranking

        # Group similar votes and rank by frequency and confidence
        vote_analysis = {}
        for vote in votes:
            option = vote.vote
            if option not in vote_analysis:
                vote_analysis[option] = {
                    'votes': [],
                    'total_confidence': 0,
                    'rationales': []
                }

            vote_analysis[option]['votes'].append(vote)
            vote_analysis[option]['total_confidence'] += vote.confidence
            vote_analysis[option]['rationales'].append(vote.rationale)

        # Rank options by combined score
        ranked_options = []
        total_votes = len(votes)

        for option, data in vote_analysis.items():
            vote_count = len(data['votes'])
            avg_confidence = data['total_confidence'] / vote_count
            combined_score = (vote_count / total_votes) * avg_confidence

            ranked_options.append({
                'option': option,
                'score': combined_score,
                'vote_count': vote_count,
                'avg_confidence': avg_confidence
            })

        ranked_options.sort(key=lambda x: x['score'], reverse=True)

        if ranked_options:
            top_option = ranked_options[0]
            consensus_reached = top_option['score'] >= threshold

            return ConsensusResult(
                item_id=item.item_id,
                algorithm_used=ConsensusAlgorithm.NOMINAL_GROUP,
                consensus_reached=consensus_reached,
                final_decision=top_option['option'] if consensus_reached else None,
                confidence_score=top_option['score'],
                agreement_percentage=top_option['score'] * 100,
                vote_distribution={opt['option']: opt['vote_count'] for opt in ranked_options},
                weighted_scores={opt['option']: opt['score'] for opt in ranked_options},
                dissenting_opinions=self._get_dissenting_opinions(votes, top_option['option']),
                convergence_metrics={"ranking_stability": 0.8},
                consensus_strength=self._calculate_consensus_strength(top_option['score'] * 100),
                decision_rationale=f"NGT consensus: {top_option['option']} (score: {top_option['score']:.2f})",
                recommendations=[],
                follow_up_actions=[] if consensus_reached else ["Facilitate group discussion"]
            )

        return self._empty_consensus_result(item, ConsensusAlgorithm.NOMINAL_GROUP)

    async def _consensus_threshold(self, item: DecisionItem, votes: List[ExpertVote],
                                 experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Consensus threshold method"""
        return await self._weighted_voting(item, votes, experts, threshold)

    async def _bayesian_consensus(self, item: DecisionItem, votes: List[ExpertVote],
                                experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Bayesian consensus method"""
        # Simplified Bayesian approach
        # In practice, would use proper Bayesian updating

        if not votes:
            return self._empty_consensus_result(item, ConsensusAlgorithm.BAYESIAN_CONSENSUS)

        # Use expert confidence as likelihood weights
        option_priors = {option: 1.0 for option in item.options}  # Uniform priors
        option_posteriors = {}

        for option in item.options:
            posterior = option_priors[option]
            option_votes = [v for v in votes if v.vote == option]

            for vote in option_votes:
                # Update posterior with confidence as likelihood
                likelihood = vote.confidence
                posterior *= likelihood

            option_posteriors[option] = posterior

        # Normalize posteriors
        total_posterior = sum(option_posteriors.values())
        if total_posterior > 0:
            for option in option_posteriors:
                option_posteriors[option] /= total_posterior

        # Find best option
        if option_posteriors:
            best_option = max(option_posteriors, key=option_posteriors.get)
            best_probability = option_posteriors[best_option]
            consensus_reached = best_probability >= threshold

            return ConsensusResult(
                item_id=item.item_id,
                algorithm_used=ConsensusAlgorithm.BAYESIAN_CONSENSUS,
                consensus_reached=consensus_reached,
                final_decision=best_option if consensus_reached else None,
                confidence_score=best_probability,
                agreement_percentage=best_probability * 100,
                vote_distribution={opt: len([v for v in votes if v.vote == opt]) for opt in item.options},
                weighted_scores=option_posteriors,
                dissenting_opinions=self._get_dissenting_opinions(votes, best_option),
                convergence_metrics={"posterior_entropy": self._calculate_entropy(option_posteriors)},
                consensus_strength=self._calculate_consensus_strength(best_probability * 100),
                decision_rationale=f"Bayesian consensus: {best_option} (probability: {best_probability:.2f})",
                recommendations=[],
                follow_up_actions=[] if consensus_reached else ["Gather additional evidence"]
            )

        return self._empty_consensus_result(item, ConsensusAlgorithm.BAYESIAN_CONSENSUS)

    async def _fuzzy_consensus(self, item: DecisionItem, votes: List[ExpertVote],
                             experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Fuzzy consensus method"""
        # Simplified fuzzy logic approach
        # Would typically use fuzzy membership functions

        if not votes:
            return self._empty_consensus_result(item, ConsensusAlgorithm.FUZZY_CONSENSUS)

        # Calculate fuzzy membership for each option
        fuzzy_scores = {}
        for option in item.options:
            option_votes = [v for v in votes if v.vote == option]
            if option_votes:
                # Fuzzy membership based on confidence and vote count
                confidence_scores = [v.confidence for v in option_votes]
                membership = (
                    np.mean(confidence_scores) *  # Average confidence
                    (len(option_votes) / len(votes))  # Vote proportion
                )
                fuzzy_scores[option] = membership
            else:
                fuzzy_scores[option] = 0.0

        # Find option with highest fuzzy membership
        best_option = max(fuzzy_scores, key=fuzzy_scores.get)
        best_score = fuzzy_scores[best_option]
        consensus_reached = best_score >= threshold

        return ConsensusResult(
            item_id=item.item_id,
            algorithm_used=ConsensusAlgorithm.FUZZY_CONSENSUS,
            consensus_reached=consensus_reached,
            final_decision=best_option if consensus_reached else None,
            confidence_score=best_score,
            agreement_percentage=best_score * 100,
            vote_distribution={opt: len([v for v in votes if v.vote == opt]) for opt in item.options},
            weighted_scores=fuzzy_scores,
            dissenting_opinions=self._get_dissenting_opinions(votes, best_option),
            convergence_metrics={"fuzzy_entropy": self._calculate_entropy(fuzzy_scores)},
            consensus_strength=self._calculate_consensus_strength(best_score * 100),
            decision_rationale=f"Fuzzy consensus: {best_option} (membership: {best_score:.2f})",
            recommendations=[],
            follow_up_actions=[] if consensus_reached else ["Refine decision criteria"]
        )

    async def _expert_weighted(self, item: DecisionItem, votes: List[ExpertVote],
                             experts: List[ExpertProfile], threshold: float) -> ConsensusResult:
        """Expert-weighted consensus with domain expertise"""
        # Enhanced weighted voting considering expertise domains

        if not votes:
            return self._empty_consensus_result(item, ConsensusAlgorithm.EXPERT_WEIGHTED)

        # Calculate expertise weights based on relevant domains
        expertise_weights = {}
        for expert in experts:
            base_weight = expert.weight_factor

            # Enhance weight based on relevant expertise
            domain_match = 0
            if hasattr(item, 'expertise_domains_required'):
                matching_domains = set(expert.expertise_domains) & set(item.expertise_domains_required)
                domain_match = len(matching_domains) / max(len(item.expertise_domains_required), 1)

            # Consider years of experience
            experience_factor = min(expert.years_experience / 20.0, 1.0)  # Cap at 20 years

            # Calculate final weight
            final_weight = base_weight * (1 + domain_match) * (1 + experience_factor * 0.5)
            expertise_weights[expert.expert_id] = final_weight

        # Apply weighted voting with expertise weights
        weighted_counts = {}
        total_weight = 0
        vote_counts = {}

        for vote in votes:
            option = vote.vote
            expert_weight = expertise_weights.get(vote.expert_id, 1.0)
            confidence_weight = vote.confidence
            final_vote_weight = expert_weight * confidence_weight

            weighted_counts[option] = weighted_counts.get(option, 0) + final_vote_weight
            vote_counts[option] = vote_counts.get(option, 0) + 1
            total_weight += final_vote_weight

        if total_weight == 0:
            return self._empty_consensus_result(item, ConsensusAlgorithm.EXPERT_WEIGHTED)

        # Calculate percentages
        weighted_percentages = {
            option: (weight / total_weight) * 100
            for option, weight in weighted_counts.items()
        }

        # Find winning option
        winning_option = max(weighted_percentages, key=weighted_percentages.get)
        winning_percentage = weighted_percentages[winning_option]

        consensus_reached = winning_percentage >= (threshold * 100)

        return ConsensusResult(
            item_id=item.item_id,
            algorithm_used=ConsensusAlgorithm.EXPERT_WEIGHTED,
            consensus_reached=consensus_reached,
            final_decision=winning_option if consensus_reached else None,
            confidence_score=winning_percentage / 100,
            agreement_percentage=winning_percentage,
            vote_distribution=vote_counts,
            weighted_scores=weighted_percentages,
            dissenting_opinions=self._get_dissenting_opinions(votes, winning_option),
            convergence_metrics={
                "total_expertise_weight": total_weight,
                "average_expert_weight": np.mean(list(expertise_weights.values()))
            },
            consensus_strength=self._calculate_consensus_strength(winning_percentage),
            decision_rationale=f"Expert-weighted consensus: {winning_option} ({winning_percentage:.1f}%)",
            recommendations=[],
            follow_up_actions=[] if consensus_reached else ["Consult additional domain experts"]
        )

    def _empty_consensus_result(self, item: DecisionItem,
                              algorithm: ConsensusAlgorithm) -> ConsensusResult:
        """Create empty consensus result"""
        return ConsensusResult(
            item_id=item.item_id,
            algorithm_used=algorithm,
            consensus_reached=False,
            final_decision=None,
            confidence_score=0.0,
            agreement_percentage=0.0,
            vote_distribution={},
            weighted_scores={},
            dissenting_opinions=[],
            convergence_metrics={},
            consensus_strength="none",
            decision_rationale="Insufficient data for consensus",
            recommendations=["Gather expert opinions"],
            follow_up_actions=["Schedule expert consultations"]
        )

    def _get_dissenting_opinions(self, votes: List[ExpertVote],
                               winning_option: str) -> List[Dict[str, Any]]:
        """Get dissenting opinions from votes"""
        dissenting = []
        for vote in votes:
            if vote.vote != winning_option:
                dissenting.append({
                    'expert_id': vote.expert_id,
                    'vote': vote.vote,
                    'confidence': vote.confidence,
                    'rationale': vote.rationale,
                    'concerns': vote.concerns
                })
        return dissenting

    def _calculate_consensus_strength(self, percentage: float) -> str:
        """Calculate consensus strength category"""
        if percentage >= 90:
            return "very_strong"
        elif percentage >= 80:
            return "strong"
        elif percentage >= 70:
            return "moderate"
        elif percentage >= 60:
            return "weak"
        else:
            return "very_weak"

    def _calculate_convergence(self, votes: List[ExpertVote]) -> float:
        """Calculate convergence score for iterative methods"""
        if len(votes) < 2:
            return 0.0

        # Simplified convergence based on confidence variance
        confidences = [vote.confidence for vote in votes]
        confidence_variance = np.var(confidences)

        # Lower variance = higher convergence
        convergence = max(0.0, 1.0 - confidence_variance)
        return convergence

    def _calculate_entropy(self, distribution: Dict[str, float]) -> float:
        """Calculate entropy of probability distribution"""
        if not distribution:
            return 0.0

        total = sum(distribution.values())
        if total == 0:
            return 0.0

        entropy = 0.0
        for value in distribution.values():
            if value > 0:
                probability = value / total
                entropy -= probability * np.log2(probability)

        return entropy

class RealtimeAdvisoryBoardService:
    """Main real-time advisory board service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.consensus_engine = ConsensusEngine(config.get('consensus_config', {}))
        self.redis_client = None
        self.postgres_pool = None
        self.socketio_server = None
        self.active_sessions: Dict[str, AdvisorySession] = {}
        self.expert_profiles: Dict[str, ExpertProfile] = {}

    async def initialize(self):
        """Initialize advisory board service"""
        # Initialize Redis
        redis_config = self.config.get('redis_config', {})
        self.redis_client = redis.Redis(
            host=redis_config.get('host', 'localhost'),
            port=redis_config.get('port', 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL
        postgres_url = self.config.get('postgres_url')
        if postgres_url:
            self.postgres_pool = await asyncpg.create_pool(postgres_url)

        # Initialize SocketIO for real-time communication
        self.socketio_server = socketio.AsyncServer(
            cors_allowed_origins="*",
            logger=True,
            engineio_logger=True
        )

        # Register SocketIO event handlers
        self._register_socketio_handlers()

        # Load expert profiles
        await self._load_expert_profiles()

        logger.info("Real-time Advisory Board Service initialized")

    def _register_socketio_handlers(self):
        """Register SocketIO event handlers"""

        @self.socketio_server.event
        async def join_advisory_session(sid, data):
            """Handle expert joining advisory session"""
            session_id = data.get('session_id')
            expert_id = data.get('expert_id')

            if not session_id or not expert_id:
                await self.socketio_server.emit('error', {
                    'message': 'Session ID and Expert ID required'
                }, to=sid)
                return

            session = self.active_sessions.get(session_id)
            if not session:
                await self.socketio_server.emit('error', {
                    'message': 'Session not found'
                }, to=sid)
                return

            # Add expert to session
            if expert_id not in session.attending_experts:
                session.attending_experts.append(expert_id)

            # Join SocketIO room
            await self.socketio_server.enter_room(sid, f"advisory_{session_id}")

            # Notify other participants
            await self.socketio_server.emit('expert_joined', {
                'expert_id': expert_id,
                'session_id': session_id,
                'timestamp': datetime.utcnow().isoformat()
            }, room=f"advisory_{session_id}", skip_sid=sid)

        @self.socketio_server.event
        async def cast_advisory_vote(sid, data):
            """Handle expert vote casting"""
            session_id = data.get('session_id')
            item_id = data.get('item_id')
            vote_data = data.get('vote_data')

            try:
                vote = ExpertVote(
                    vote_id=str(uuid.uuid4()),
                    expert_id=vote_data['expert_id'],
                    item_id=item_id,
                    vote=vote_data['vote'],
                    confidence=vote_data['confidence'],
                    rationale=vote_data['rationale'],
                    supporting_evidence=vote_data.get('supporting_evidence', []),
                    concerns=vote_data.get('concerns', []),
                    alternative_suggestions=vote_data.get('alternative_suggestions', [])
                )

                # Add vote to session
                session = self.active_sessions.get(session_id)
                if session:
                    session.votes.append(vote)

                    # Notify participants
                    await self.socketio_server.emit('vote_cast', {
                        'vote_id': vote.vote_id,
                        'item_id': item_id,
                        'expert_id': vote.expert_id,
                        'timestamp': vote.timestamp.isoformat()
                    }, room=f"advisory_{session_id}")

                    # Check if consensus can be evaluated
                    await self._evaluate_consensus_for_item(session, item_id)

            except Exception as e:
                await self.socketio_server.emit('error', {
                    'message': f'Vote casting failed: {str(e)}'
                }, to=sid)

    async def create_advisory_session(self, session_data: Dict[str, Any]) -> AdvisorySession:
        """Create new advisory board session"""
        with tracer.start_as_current_span("create_advisory_session") as span:
            session_id = str(uuid.uuid4())

            # Create decision items
            decision_items = []
            for item_data in session_data.get('decision_items', []):
                decision_item = DecisionItem(
                    item_id=str(uuid.uuid4()),
                    title=item_data['title'],
                    description=item_data['description'],
                    decision_type=DecisionType(item_data['decision_type']),
                    options=item_data['options'],
                    supporting_data=item_data.get('supporting_data', {}),
                    background_materials=item_data.get('background_materials', []),
                    regulatory_context=item_data.get('regulatory_context'),
                    clinical_context=item_data.get('clinical_context'),
                    priority=item_data.get('priority', 'medium')
                )
                decision_items.append(decision_item)

            session = AdvisorySession(
                session_id=session_id,
                title=session_data['title'],
                session_type=SessionType(session_data['session_type']),
                organization_id=session_data['organization_id'],
                chair_id=session_data['chair_id'],
                scheduled_start=datetime.fromisoformat(session_data['scheduled_start']),
                scheduled_end=datetime.fromisoformat(session_data['scheduled_end']),
                invited_experts=session_data['invited_experts'],
                agenda=session_data.get('agenda', []),
                decision_items=decision_items,
                consensus_algorithm=ConsensusAlgorithm(
                    session_data.get('consensus_algorithm', 'weighted_voting')
                ),
                consensus_threshold=session_data.get('consensus_threshold', 0.7)
            )

            self.active_sessions[session_id] = session

            # Store session
            await self._store_session(session)

            # Record metrics
            advisory_sessions.add(1, {"session_type": session.session_type.value})

            span.set_attribute("session_id", session_id)
            span.set_attribute("session_type", session.session_type.value)

            logger.info(f"Created advisory session {session_id}")
            return session

    async def start_advisory_session(self, session_id: str, chair_id: str) -> bool:
        """Start advisory board session"""
        session = self.active_sessions.get(session_id)
        if not session:
            return False

        if session.chair_id != chair_id:
            return False

        session.status = SessionStatus.ACTIVE
        session.actual_start = datetime.utcnow()

        # Notify participants via SocketIO
        if self.socketio_server:
            await self.socketio_server.emit('session_started', {
                'session_id': session_id,
                'started_at': session.actual_start.isoformat(),
                'agenda': session.agenda,
                'decision_items': [asdict(item) for item in session.decision_items]
            }, room=f"advisory_{session_id}")

        logger.info(f"Started advisory session {session_id}")
        return True

    async def _evaluate_consensus_for_item(self, session: AdvisorySession, item_id: str):
        """Evaluate consensus for a specific decision item"""
        decision_item = next((item for item in session.decision_items if item.item_id == item_id), None)
        if not decision_item:
            return

        # Get votes for this item
        item_votes = [vote for vote in session.votes if vote.item_id == item_id]

        # Get participating experts
        participating_experts = [
            self.expert_profiles[expert_id]
            for expert_id in session.attending_experts
            if expert_id in self.expert_profiles
        ]

        # Build consensus
        consensus_result = await self.consensus_engine.build_consensus(
            decision_item, item_votes, participating_experts,
            session.consensus_algorithm, session.consensus_threshold
        )

        # Add to session results
        existing_result_idx = None
        for i, result in enumerate(session.consensus_results):
            if result.item_id == item_id:
                existing_result_idx = i
                break

        if existing_result_idx is not None:
            session.consensus_results[existing_result_idx] = consensus_result
        else:
            session.consensus_results.append(consensus_result)

        # Notify participants
        if self.socketio_server:
            await self.socketio_server.emit('consensus_update', {
                'item_id': item_id,
                'consensus_reached': consensus_result.consensus_reached,
                'final_decision': consensus_result.final_decision,
                'confidence_score': consensus_result.confidence_score,
                'agreement_percentage': consensus_result.agreement_percentage,
                'consensus_strength': consensus_result.consensus_strength
            }, room=f"advisory_{session.session_id}")

        # Update session status if all items have consensus
        if self._all_items_have_consensus(session):
            session.status = SessionStatus.COMPLETED
            await self.socketio_server.emit('session_completed', {
                'session_id': session.session_id,
                'completed_at': datetime.utcnow().isoformat()
            }, room=f"advisory_{session.session_id}")

    def _all_items_have_consensus(self, session: AdvisorySession) -> bool:
        """Check if all decision items have reached consensus"""
        if not session.decision_items:
            return False

        consensus_item_ids = {result.item_id for result in session.consensus_results if result.consensus_reached}
        decision_item_ids = {item.item_id for item in session.decision_items}

        return consensus_item_ids == decision_item_ids

    async def end_advisory_session(self, session_id: str, chair_id: str) -> Dict[str, Any]:
        """End advisory board session"""
        session = self.active_sessions.get(session_id)
        if not session or session.chair_id != chair_id:
            return {'success': False, 'error': 'Unauthorized or session not found'}

        session.status = SessionStatus.COMPLETED
        session.actual_end = datetime.utcnow()

        # Calculate session metrics
        session.participation_rate = (
            len(session.attending_experts) / max(len(session.invited_experts), 1)
        )

        # Update expert participation metrics
        expert_participation.set(session.participation_rate)

        # Generate session summary
        summary = {
            'session_id': session_id,
            'title': session.title,
            'duration_minutes': (session.actual_end - session.actual_start).total_seconds() / 60 if session.actual_start else 0,
            'participation_rate': session.participation_rate,
            'decisions_made': len([r for r in session.consensus_results if r.consensus_reached]),
            'total_decision_items': len(session.decision_items),
            'consensus_results': [asdict(result) for result in session.consensus_results]
        }

        # Archive session
        await self._archive_session(session)

        # Notify participants
        if self.socketio_server:
            await self.socketio_server.emit('session_ended', summary, room=f"advisory_{session_id}")

        logger.info(f"Ended advisory session {session_id}")
        return {'success': True, 'summary': summary}

    async def _load_expert_profiles(self):
        """Load expert profiles from database"""
        if not self.postgres_pool:
            return

        try:
            async with self.postgres_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT expert_id, expert_data
                    FROM expert_profiles
                    WHERE active = true
                """)

                for row in rows:
                    expert_data = json.loads(row['expert_data'])
                    expert = self._deserialize_expert(expert_data)
                    self.expert_profiles[expert.expert_id] = expert

                logger.info(f"Loaded {len(self.expert_profiles)} expert profiles")

        except Exception as e:
            logger.error(f"Failed to load expert profiles: {e}")

    def _deserialize_expert(self, data: Dict[str, Any]) -> ExpertProfile:
        """Deserialize expert profile from data"""
        return ExpertProfile(**data)

    async def _store_session(self, session: AdvisorySession):
        """Store session in database"""
        if not self.postgres_pool:
            return

        try:
            session_data = json.dumps(asdict(session), default=str)

            async with self.postgres_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO advisory_sessions
                    (session_id, title, session_type, organization_id, chair_id,
                     status, session_data, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """, session.session_id, session.title, session.session_type.value,
                session.organization_id, session.chair_id, session.status.value,
                session_data, session.created_at)

        except Exception as e:
            logger.error(f"Failed to store session: {e}")

    async def _archive_session(self, session: AdvisorySession):
        """Archive completed session"""
        if not self.postgres_pool:
            return

        try:
            session_data = json.dumps(asdict(session), default=str)

            async with self.postgres_pool.acquire() as conn:
                await conn.execute("""
                    UPDATE advisory_sessions
                    SET status = $1, session_data = $2, updated_at = $3
                    WHERE session_id = $4
                """, session.status.value, session_data, session.updated_at, session.session_id)

        except Exception as e:
            logger.error(f"Failed to archive session: {e}")

    def get_websocket_app(self):
        """Get WebSocket ASGI app"""
        return socketio.ASGIApp(self.socketio_server)

    async def get_session_status(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current session status"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None

        return {
            'session_id': session_id,
            'status': session.status.value,
            'attending_experts': len(session.attending_experts),
            'total_invited': len(session.invited_experts),
            'decisions_completed': len([r for r in session.consensus_results if r.consensus_reached]),
            'total_decisions': len(session.decision_items),
            'current_phase': 'voting' if session.status == SessionStatus.CONSENSUS_BUILDING else 'discussion'
        }

    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Real-time Advisory Board Service")

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Real-time Advisory Board Service shutdown complete")

# Factory function
async def create_advisory_board_service(config: Dict[str, Any]) -> RealtimeAdvisoryBoardService:
    """Create and initialize Real-time Advisory Board Service"""
    service = RealtimeAdvisoryBoardService(config)
    await service.initialize()
    return service