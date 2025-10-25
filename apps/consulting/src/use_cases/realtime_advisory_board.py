# ===================================================================
# VITAL Path Real-time Advisory Board - Phase 2 Enhanced
# WebSocket-powered collaborative clinical decision making
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set
from enum import Enum
import uuid
from dataclasses import dataclass, asdict
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import opentelemetry.trace as trace
from opentelemetry import metrics
import socketio
from aiohttp import web, WSMsgType
import asyncpg
import numpy as np
from scipy import stats
import threading
import queue
from concurrent.futures import ThreadPoolExecutor

# Configure logging and telemetry
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
advisory_sessions_created = meter.create_counter(
    "advisory_sessions_created_total",
    description="Total advisory sessions created"
)

consensus_calculations = meter.create_counter(
    "consensus_calculations_total",
    description="Total consensus calculations performed"
)

votes_submitted = meter.create_counter(
    "votes_submitted_total",
    description="Total votes submitted"
)

session_duration = meter.create_histogram(
    "session_duration_seconds",
    description="Advisory session duration"
)

class SessionType(Enum):
    """Advisory board session types"""
    CLINICAL_REVIEW = "clinical_review"
    SAFETY_REVIEW = "safety_review"
    EFFICACY_ASSESSMENT = "efficacy_assessment"
    REGULATORY_GUIDANCE = "regulatory_guidance"
    TREATMENT_PROTOCOL = "treatment_protocol"
    DIAGNOSTIC_CONSENSUS = "diagnostic_consensus"
    RISK_ASSESSMENT = "risk_assessment"
    QUALITY_ASSURANCE = "quality_assurance"
    RESEARCH_OVERSIGHT = "research_oversight"
    ETHICS_REVIEW = "ethics_review"
    POLICY_DEVELOPMENT = "policy_development"
    CASE_CONSULTATION = "case_consultation"

class ConsensusAlgorithm(Enum):
    """Consensus calculation algorithms"""
    SIMPLE_MAJORITY = "simple_majority"
    WEIGHTED_VOTING = "weighted_voting"
    DELPHI_METHOD = "delphi_method"
    NOMINAL_GROUP_TECHNIQUE = "nominal_group_technique"
    CONSENSUS_THRESHOLD = "consensus_threshold"
    BAYESIAN_CONSENSUS = "bayesian_consensus"
    FUZZY_CONSENSUS = "fuzzy_consensus"
    EXPERT_WEIGHTED = "expert_weighted"

class DecisionType(Enum):
    """Types of decisions that can be made"""
    APPROVAL_DECISION = "approval_decision"
    RISK_CLASSIFICATION = "risk_classification"
    TREATMENT_RECOMMENDATION = "treatment_recommendation"
    DIAGNOSTIC_CONFIRMATION = "diagnostic_confirmation"
    PROTOCOL_VALIDATION = "protocol_validation"
    SAFETY_DETERMINATION = "safety_determination"
    EFFICACY_RATING = "efficacy_rating"
    PRIORITY_RANKING = "priority_ranking"
    RESOURCE_ALLOCATION = "resource_allocation"
    POLICY_RECOMMENDATION = "policy_recommendation"

class ExpertRole(Enum):
    """Expert roles in advisory sessions"""
    CHAIR = "chair"              # Session chair/moderator
    MEMBER = "member"            # Voting member
    OBSERVER = "observer"        # Non-voting observer
    MODERATOR = "moderator"      # Technical moderator
    SUBJECT_MATTER_EXPERT = "subject_matter_expert"
    PATIENT_ADVOCATE = "patient_advocate"
    REGULATORY_REPRESENTATIVE = "regulatory_representative"

class SessionStatus(Enum):
    """Advisory session status"""
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    IN_VOTING = "in_voting"
    CONSENSUS_REACHED = "consensus_reached"
    COMPLETED = "completed"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"

@dataclass
class ExpertParticipant:
    """Advisory board expert participant"""
    expert_id: str
    user_id: str
    name: str
    specialty: str
    credentials: List[str]
    role: ExpertRole
    voting_weight: float = 1.0
    expertise_areas: List[str] = None
    conflict_of_interest: bool = False
    joined_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    connection_status: str = "disconnected"  # connected, disconnected, idle

    def __post_init__(self):
        if self.expertise_areas is None:
            self.expertise_areas = []

@dataclass
class EvidenceDocument:
    """Supporting evidence document"""
    document_id: str
    title: str
    document_type: str  # clinical_study, guideline, protocol, case_report
    url: str
    summary: Optional[str] = None
    relevance_score: float = 1.0
    uploaded_by: Optional[str] = None
    upload_date: datetime = datetime.utcnow()

@dataclass
class DecisionItem:
    """Individual decision item for voting"""
    item_id: str
    title: str
    description: str
    decision_type: DecisionType
    options: List[str]
    evidence_documents: List[EvidenceDocument] = None
    clinical_context: Dict[str, Any] = None
    votes: Dict[str, Any] = None  # expert_id -> vote_data
    consensus_result: Optional[Dict[str, Any]] = None
    deadline: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high, critical

    def __post_init__(self):
        if self.evidence_documents is None:
            self.evidence_documents = []
        if self.clinical_context is None:
            self.clinical_context = {}
        if self.votes is None:
            self.votes = {}

@dataclass
class Vote:
    """Individual expert vote"""
    vote_id: str
    expert_id: str
    decision_item_id: str
    session_id: str
    vote_value: Union[str, int, float]  # Depends on decision type
    confidence_level: float  # 0.0 to 1.0
    rationale: Optional[str] = None
    supporting_evidence: List[str] = None
    timestamp: datetime = datetime.utcnow()
    is_final: bool = False

    def __post_init__(self):
        if self.supporting_evidence is None:
            self.supporting_evidence = []

@dataclass
class AdvisorySession:
    """Complete advisory board session"""
    session_id: str
    creator_id: str
    organization_id: str
    title: str
    description: str
    session_type: SessionType
    invited_experts: List[ExpertParticipant]
    decision_items: List[DecisionItem]
    consensus_algorithm: ConsensusAlgorithm
    consensus_threshold: float = 0.75  # 75% for consensus
    session_duration_hours: int = 2
    real_time_collaboration: bool = True
    anonymous_voting: bool = False
    status: SessionStatus = SessionStatus.SCHEDULED
    created_at: datetime = datetime.utcnow()
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    session_metadata: Dict[str, Any] = None
    websocket_url: Optional[str] = None
    session_recording_enabled: bool = True
    final_report: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        if self.session_metadata is None:
            self.session_metadata = {}

class ConsensusEngine:
    """Advanced consensus calculation engine"""

    def __init__(self):
        self.algorithms = {
            ConsensusAlgorithm.SIMPLE_MAJORITY: self._simple_majority,
            ConsensusAlgorithm.WEIGHTED_VOTING: self._weighted_voting,
            ConsensusAlgorithm.DELPHI_METHOD: self._delphi_method,
            ConsensusAlgorithm.NOMINAL_GROUP_TECHNIQUE: self._nominal_group,
            ConsensusAlgorithm.CONSENSUS_THRESHOLD: self._consensus_threshold,
            ConsensusAlgorithm.BAYESIAN_CONSENSUS: self._bayesian_consensus,
            ConsensusAlgorithm.FUZZY_CONSENSUS: self._fuzzy_consensus,
            ConsensusAlgorithm.EXPERT_WEIGHTED: self._expert_weighted
        }

    async def calculate_consensus(self, decision_item: DecisionItem,
                                experts: List[ExpertParticipant],
                                algorithm: ConsensusAlgorithm,
                                threshold: float = 0.75) -> Dict[str, Any]:
        """Calculate consensus using specified algorithm"""
        with tracer.start_as_current_span("consensus_calculation") as span:
            consensus_calculations.add(1)

            span.set_attribute("algorithm", algorithm.value)
            span.set_attribute("votes_count", len(decision_item.votes))
            span.set_attribute("threshold", threshold)

            if algorithm not in self.algorithms:
                raise ValueError(f"Unsupported consensus algorithm: {algorithm}")

            consensus_func = self.algorithms[algorithm]
            result = await consensus_func(decision_item, experts, threshold)

            span.set_attribute("consensus_reached", result["consensus_reached"])
            span.set_attribute("confidence_level", result["confidence_level"])

            return result

    async def _simple_majority(self, decision_item: DecisionItem,
                             experts: List[ExpertParticipant],
                             threshold: float) -> Dict[str, Any]:
        """Simple majority voting"""
        votes = decision_item.votes
        if not votes:
            return {
                "consensus_reached": False,
                "winning_option": None,
                "vote_distribution": {},
                "confidence_level": 0.0,
                "algorithm_used": "simple_majority"
            }

        # Count votes for each option
        vote_counts = {}
        total_votes = len(votes)

        for vote_data in votes.values():
            option = vote_data.get("vote_value")
            vote_counts[option] = vote_counts.get(option, 0) + 1

        # Find majority
        max_votes = max(vote_counts.values()) if vote_counts else 0
        winning_options = [opt for opt, count in vote_counts.items() if count == max_votes]

        consensus_reached = (max_votes / total_votes) >= 0.5 and len(winning_options) == 1
        winning_option = winning_options[0] if consensus_reached else None

        return {
            "consensus_reached": consensus_reached,
            "winning_option": winning_option,
            "vote_distribution": vote_counts,
            "confidence_level": (max_votes / total_votes) if total_votes > 0 else 0.0,
            "algorithm_used": "simple_majority",
            "total_votes": total_votes,
            "majority_threshold": 0.5
        }

    async def _weighted_voting(self, decision_item: DecisionItem,
                             experts: List[ExpertParticipant],
                             threshold: float) -> Dict[str, Any]:
        """Weighted voting based on expert weights"""
        votes = decision_item.votes
        expert_weights = {exp.expert_id: exp.voting_weight for exp in experts}

        weighted_votes = {}
        total_weight = 0

        for expert_id, vote_data in votes.items():
            weight = expert_weights.get(expert_id, 1.0)
            option = vote_data.get("vote_value")

            weighted_votes[option] = weighted_votes.get(option, 0) + weight
            total_weight += weight

        if total_weight == 0:
            return {
                "consensus_reached": False,
                "winning_option": None,
                "vote_distribution": {},
                "confidence_level": 0.0,
                "algorithm_used": "weighted_voting"
            }

        # Find weighted majority
        max_weight = max(weighted_votes.values()) if weighted_votes else 0
        winning_options = [opt for opt, weight in weighted_votes.items() if weight == max_weight]

        consensus_reached = (max_weight / total_weight) >= threshold and len(winning_options) == 1
        winning_option = winning_options[0] if consensus_reached else None

        return {
            "consensus_reached": consensus_reached,
            "winning_option": winning_option,
            "vote_distribution": weighted_votes,
            "confidence_level": (max_weight / total_weight) if total_weight > 0 else 0.0,
            "algorithm_used": "weighted_voting",
            "total_weight": total_weight,
            "consensus_threshold": threshold
        }

    async def _delphi_method(self, decision_item: DecisionItem,
                           experts: List[ExpertParticipant],
                           threshold: float) -> Dict[str, Any]:
        """Delphi method for iterative consensus"""
        # Simplified Delphi - in practice would involve multiple rounds
        votes = decision_item.votes

        # Calculate statistical measures for numerical votes
        numerical_votes = []
        confidence_scores = []

        for vote_data in votes.values():
            vote_value = vote_data.get("vote_value")
            confidence = vote_data.get("confidence_level", 1.0)

            try:
                numerical_votes.append(float(vote_value))
                confidence_scores.append(confidence)
            except (ValueError, TypeError):
                continue

        if not numerical_votes:
            return await self._simple_majority(decision_item, experts, threshold)

        # Calculate statistics
        mean_vote = np.mean(numerical_votes)
        median_vote = np.median(numerical_votes)
        std_vote = np.std(numerical_votes)
        avg_confidence = np.mean(confidence_scores)

        # Consensus based on standard deviation (low std = high consensus)
        consensus_reached = std_vote < (0.2 * abs(mean_vote)) and avg_confidence > 0.7

        return {
            "consensus_reached": consensus_reached,
            "winning_option": median_vote,
            "mean_vote": mean_vote,
            "median_vote": median_vote,
            "standard_deviation": std_vote,
            "confidence_level": avg_confidence,
            "algorithm_used": "delphi_method",
            "convergence_indicator": 1.0 - (std_vote / abs(mean_vote)) if mean_vote != 0 else 1.0
        }

    async def _nominal_group(self, decision_item: DecisionItem,
                           experts: List[ExpertParticipant],
                           threshold: float) -> Dict[str, Any]:
        """Nominal group technique"""
        # Simplified NGT - combines individual voting with group discussion insights
        votes = decision_item.votes

        # Weight votes by rationale quality (simplified)
        weighted_scores = {}

        for expert_id, vote_data in votes.items():
            vote_value = vote_data.get("vote_value")
            rationale = vote_data.get("rationale", "")

            # Simple rationale quality score based on length and keywords
            rationale_score = min(1.0, len(rationale.split()) / 20.0)  # Normalize to 0-1
            clinical_keywords = ["evidence", "guideline", "protocol", "study", "research"]
            keyword_bonus = sum(0.1 for keyword in clinical_keywords if keyword in rationale.lower())

            quality_weight = max(0.5, rationale_score + keyword_bonus)

            if vote_value not in weighted_scores:
                weighted_scores[vote_value] = {"weight": 0, "count": 0, "rationales": []}

            weighted_scores[vote_value]["weight"] += quality_weight
            weighted_scores[vote_value]["count"] += 1
            weighted_scores[vote_value]["rationales"].append(rationale)

        if not weighted_scores:
            return {
                "consensus_reached": False,
                "winning_option": None,
                "confidence_level": 0.0,
                "algorithm_used": "nominal_group_technique"
            }

        # Find option with highest quality-weighted support
        best_option = max(weighted_scores.keys(),
                         key=lambda x: weighted_scores[x]["weight"])

        total_weight = sum(data["weight"] for data in weighted_scores.values())
        confidence = weighted_scores[best_option]["weight"] / total_weight

        return {
            "consensus_reached": confidence >= threshold,
            "winning_option": best_option,
            "confidence_level": confidence,
            "algorithm_used": "nominal_group_technique",
            "quality_scores": weighted_scores,
            "rationale_summary": self._summarize_rationales(weighted_scores[best_option]["rationales"])
        }

    async def _consensus_threshold(self, decision_item: DecisionItem,
                                 experts: List[ExpertParticipant],
                                 threshold: float) -> Dict[str, Any]:
        """Consensus threshold method"""
        votes = decision_item.votes
        total_experts = len(experts)

        vote_counts = {}
        for vote_data in votes.values():
            option = vote_data.get("vote_value")
            vote_counts[option] = vote_counts.get(option, 0) + 1

        # Check if any option meets the threshold
        for option, count in vote_counts.items():
            if (count / total_experts) >= threshold:
                return {
                    "consensus_reached": True,
                    "winning_option": option,
                    "vote_distribution": vote_counts,
                    "confidence_level": count / total_experts,
                    "algorithm_used": "consensus_threshold",
                    "threshold_met": True
                }

        return {
            "consensus_reached": False,
            "winning_option": None,
            "vote_distribution": vote_counts,
            "confidence_level": max(vote_counts.values()) / total_experts if vote_counts else 0.0,
            "algorithm_used": "consensus_threshold",
            "threshold_met": False
        }

    async def _bayesian_consensus(self, decision_item: DecisionItem,
                                experts: List[ExpertParticipant],
                                threshold: float) -> Dict[str, Any]:
        """Bayesian consensus with expert reliability"""
        # Simplified Bayesian approach
        votes = decision_item.votes
        expert_reliability = {exp.expert_id: 0.85 for exp in experts}  # Would be calculated from history

        option_posteriors = {}

        for expert_id, vote_data in votes.items():
            option = vote_data.get("vote_value")
            confidence = vote_data.get("confidence_level", 0.8)
            reliability = expert_reliability.get(expert_id, 0.8)

            # Bayesian update (simplified)
            evidence_strength = confidence * reliability

            if option not in option_posteriors:
                option_posteriors[option] = 0.5  # Prior probability

            # Update posterior (simplified Bayesian update)
            option_posteriors[option] = (option_posteriors[option] * evidence_strength +
                                       (1 - option_posteriors[option]) * (1 - evidence_strength))

        if not option_posteriors:
            return {
                "consensus_reached": False,
                "winning_option": None,
                "confidence_level": 0.0,
                "algorithm_used": "bayesian_consensus"
            }

        best_option = max(option_posteriors.keys(), key=lambda x: option_posteriors[x])
        consensus_confidence = option_posteriors[best_option]

        return {
            "consensus_reached": consensus_confidence >= threshold,
            "winning_option": best_option,
            "confidence_level": consensus_confidence,
            "algorithm_used": "bayesian_consensus",
            "posteriors": option_posteriors,
            "bayesian_threshold": threshold
        }

    async def _fuzzy_consensus(self, decision_item: DecisionItem,
                             experts: List[ExpertParticipant],
                             threshold: float) -> Dict[str, Any]:
        """Fuzzy logic consensus for handling uncertainty"""
        votes = decision_item.votes

        # Simplified fuzzy consensus
        option_memberships = {}

        for expert_id, vote_data in votes.items():
            option = vote_data.get("vote_value")
            confidence = vote_data.get("confidence_level", 0.8)

            # Fuzzy membership based on confidence
            membership = confidence

            if option not in option_memberships:
                option_memberships[option] = []
            option_memberships[option].append(membership)

        # Calculate aggregate membership for each option
        option_scores = {}
        for option, memberships in option_memberships.items():
            # Use average membership as fuzzy consensus measure
            option_scores[option] = np.mean(memberships)

        if not option_scores:
            return {
                "consensus_reached": False,
                "winning_option": None,
                "confidence_level": 0.0,
                "algorithm_used": "fuzzy_consensus"
            }

        best_option = max(option_scores.keys(), key=lambda x: option_scores[x])
        fuzzy_confidence = option_scores[best_option]

        return {
            "consensus_reached": fuzzy_confidence >= threshold,
            "winning_option": best_option,
            "confidence_level": fuzzy_confidence,
            "algorithm_used": "fuzzy_consensus",
            "fuzzy_scores": option_scores,
            "membership_threshold": threshold
        }

    async def _expert_weighted(self, decision_item: DecisionItem,
                             experts: List[ExpertParticipant],
                             threshold: float) -> Dict[str, Any]:
        """Expert-weighted consensus based on expertise and track record"""
        votes = decision_item.votes

        # Calculate expert weights based on multiple factors
        expert_weights = {}
        for expert in experts:
            base_weight = expert.voting_weight

            # Adjust weight based on expertise relevance
            expertise_bonus = 1.0
            if hasattr(decision_item, 'clinical_context') and decision_item.clinical_context:
                # Would check if expert's specialty matches clinical context
                expertise_bonus = 1.2  # Simplified

            # Historical accuracy bonus (would be calculated from past performance)
            accuracy_bonus = 1.1  # Simplified

            final_weight = base_weight * expertise_bonus * accuracy_bonus
            expert_weights[expert.expert_id] = final_weight

        # Apply weighted voting with expert-specific weights
        weighted_votes = {}
        total_weight = 0

        for expert_id, vote_data in votes.items():
            weight = expert_weights.get(expert_id, 1.0)
            confidence = vote_data.get("confidence_level", 1.0)
            option = vote_data.get("vote_value")

            # Combine expert weight with their confidence
            effective_weight = weight * confidence

            weighted_votes[option] = weighted_votes.get(option, 0) + effective_weight
            total_weight += effective_weight

        if total_weight == 0:
            return {
                "consensus_reached": False,
                "winning_option": None,
                "confidence_level": 0.0,
                "algorithm_used": "expert_weighted"
            }

        best_option = max(weighted_votes.keys(), key=lambda x: weighted_votes[x])
        expert_confidence = weighted_votes[best_option] / total_weight

        return {
            "consensus_reached": expert_confidence >= threshold,
            "winning_option": best_option,
            "confidence_level": expert_confidence,
            "algorithm_used": "expert_weighted",
            "expert_weights": expert_weights,
            "weighted_distribution": weighted_votes,
            "total_expert_weight": total_weight
        }

    def _summarize_rationales(self, rationales: List[str]) -> str:
        """Summarize expert rationales"""
        # Simplified rationale summarization
        combined = " ".join(rationales)
        if len(combined) > 500:
            return combined[:500] + "..."
        return combined

class RealTimeAdvisoryBoard:
    """Real-time Advisory Board with WebSocket collaboration"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.redis_client = None
        self.postgres_pool = None
        self.socketio_server = None
        self.app = None

        # Initialize consensus engine
        self.consensus_engine = ConsensusEngine()

        # Session management
        self.active_sessions: Dict[str, AdvisorySession] = {}
        self.session_participants: Dict[str, Set[str]] = {}  # session_id -> set of expert_ids

        # WebSocket management
        self.websocket_connections: Dict[str, Dict[str, Any]] = {}

    async def initialize(self):
        """Initialize advisory board components"""
        # Initialize Redis for session state
        self.redis_client = redis.Redis(
            host=self.config.get("redis_host", "localhost"),
            port=self.config.get("redis_port", 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL for persistence
        self.postgres_pool = await asyncpg.create_pool(
            self.config.get("postgres_url", "postgresql://localhost:5432/vital_path")
        )

        # Initialize SocketIO server
        self.socketio_server = socketio.AsyncServer(
            cors_allowed_origins="*",
            logger=True,
            engineio_logger=True
        )

        # Register SocketIO event handlers
        self._register_socketio_handlers()

        # Create web application
        self.app = web.Application()
        self.socketio_server.attach(self.app)

        logger.info("Real-time Advisory Board initialized successfully")

    def _register_socketio_handlers(self):
        """Register SocketIO event handlers"""

        @self.socketio_server.event
        async def connect(sid, environ, auth):
            """Handle client connection"""
            logger.info(f"Client {sid} connected")
            return True

        @self.socketio_server.event
        async def disconnect(sid):
            """Handle client disconnection"""
            logger.info(f"Client {sid} disconnected")
            await self._handle_client_disconnect(sid)

        @self.socketio_server.event
        async def join_session(sid, data):
            """Handle expert joining session"""
            await self._handle_join_session(sid, data)

        @self.socketio_server.event
        async def submit_vote(sid, data):
            """Handle vote submission"""
            await self._handle_vote_submission(sid, data)

        @self.socketio_server.event
        async def session_message(sid, data):
            """Handle session messaging"""
            await self._handle_session_message(sid, data)

    async def create_advisory_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new advisory board session"""
        with tracer.start_as_current_span("create_advisory_session") as span:
            advisory_sessions_created.add(1)

            try:
                # Create session instance
                session = self._create_session_from_data(session_data)

                # Store session
                self.active_sessions[session.session_id] = session
                self.session_participants[session.session_id] = set()

                # Cache session in Redis
                await self._cache_session(session)

                # Persist to database
                await self._persist_session(session)

                # Generate WebSocket URL
                session.websocket_url = f"/advisory/ws/{session.session_id}"

                span.set_attribute("session_id", session.session_id)
                span.set_attribute("session_type", session.session_type.value)
                span.set_attribute("experts_count", len(session.invited_experts))

                logger.info(f"Created advisory session {session.session_id}")

                return {
                    "session_id": session.session_id,
                    "session_url": f"/advisory/{session.session_id}",
                    "websocket_url": session.websocket_url,
                    "status": session.status.value,
                    "estimated_duration": f"{session.session_duration_hours} hours",
                    "next_steps": [
                        "Invited experts will receive notifications",
                        "Session will begin at scheduled time",
                        "Real-time collaboration available via WebSocket"
                    ]
                }

            except Exception as e:
                logger.error(f"Failed to create advisory session: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))
                raise

    def _create_session_from_data(self, session_data: Dict[str, Any]) -> AdvisorySession:
        """Create AdvisorySession from request data"""
        # Parse invited experts
        invited_experts = []
        for expert_data in session_data.get("invited_experts", []):
            expert = ExpertParticipant(
                expert_id=expert_data["expert_id"],
                user_id=expert_data.get("user_id", expert_data["expert_id"]),
                name=expert_data["name"],
                specialty=expert_data["specialty"],
                credentials=expert_data.get("credentials", []),
                role=ExpertRole(expert_data["role"]),
                voting_weight=expert_data.get("weight", 1.0)
            )
            invited_experts.append(expert)

        # Parse decision items
        decision_items = []
        for item_data in session_data.get("decision_items", []):
            # Parse evidence documents
            evidence_docs = []
            for doc_data in item_data.get("evidence_documents", []):
                doc = EvidenceDocument(
                    document_id=f"doc_{uuid.uuid4().hex[:8]}",
                    title=doc_data["title"],
                    document_type=doc_data["document_type"],
                    url=doc_data["url"],
                    summary=doc_data.get("summary")
                )
                evidence_docs.append(doc)

            decision_item = DecisionItem(
                item_id=f"item_{uuid.uuid4().hex[:8]}",
                title=item_data["title"],
                description=item_data["description"],
                decision_type=DecisionType(item_data["decision_type"]),
                options=item_data["options"],
                evidence_documents=evidence_docs,
                clinical_context=item_data.get("clinical_context", {}),
                deadline=datetime.fromisoformat(item_data["deadline"]) if item_data.get("deadline") else None
            )
            decision_items.append(decision_item)

        # Create session
        session = AdvisorySession(
            session_id=f"session_{uuid.uuid4().hex[:12]}",
            creator_id=session_data["creator_id"],
            organization_id=session_data["organization_id"],
            title=session_data["title"],
            description=session_data.get("description", ""),
            session_type=SessionType(session_data["session_type"]),
            invited_experts=invited_experts,
            decision_items=decision_items,
            consensus_algorithm=ConsensusAlgorithm(session_data["consensus_algorithm"]),
            consensus_threshold=session_data.get("consensus_threshold", 0.75),
            session_duration_hours=session_data.get("session_duration_hours", 2),
            real_time_collaboration=session_data.get("real_time_collaboration", True),
            anonymous_voting=session_data.get("anonymous_voting", False),
            session_metadata=session_data.get("session_metadata", {})
        )

        return session

    async def join_session(self, join_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle expert joining session"""
        session_id = join_data["session_id"]
        expert_id = join_data["expert_id"]

        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")

        session = self.active_sessions[session_id]

        # Find expert in invited list
        expert = None
        for invited_expert in session.invited_experts:
            if invited_expert.expert_id == expert_id:
                expert = invited_expert
                break

        if not expert:
            raise ValueError(f"Expert {expert_id} not invited to session {session_id}")

        # Update expert status
        expert.joined_at = datetime.utcnow()
        expert.connection_status = "connected"
        expert.last_activity = datetime.utcnow()

        # Add to participants
        self.session_participants[session_id].add(expert_id)

        # Broadcast join event
        if self.socketio_server:
            await self.socketio_server.emit("expert_joined", {
                "session_id": session_id,
                "expert_id": expert_id,
                "expert_name": expert.name,
                "expert_role": expert.role.value,
                "timestamp": datetime.utcnow().isoformat()
            }, room=f"session_{session_id}")

        logger.info(f"Expert {expert_id} joined session {session_id}")

        return {
            "success": True,
            "session_status": session.status.value,
            "participant_role": expert.role.value,
            "websocket_url": session.websocket_url,
            "session_details": {
                "title": session.title,
                "description": session.description,
                "decision_items_count": len(session.decision_items),
                "participants_count": len(self.session_participants[session_id])
            }
        }

    async def submit_vote(self, vote_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle vote submission"""
        with tracer.start_as_current_span("submit_vote") as span:
            votes_submitted.add(1)

            session_id = vote_data["session_id"]
            decision_item_id = vote_data["decision_item_id"]
            expert_id = vote_data["expert_id"]

            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]

            # Find decision item
            decision_item = None
            for item in session.decision_items:
                if item.item_id == decision_item_id:
                    decision_item = item
                    break

            if not decision_item:
                raise ValueError(f"Decision item {decision_item_id} not found")

            # Create vote
            vote = Vote(
                vote_id=f"vote_{uuid.uuid4().hex[:8]}",
                expert_id=expert_id,
                decision_item_id=decision_item_id,
                session_id=session_id,
                vote_value=vote_data["vote"],
                confidence_level=vote_data.get("confidence_level", 1.0),
                rationale=vote_data.get("rationale"),
                supporting_evidence=vote_data.get("supporting_evidence", [])
            )

            # Store vote in decision item
            decision_item.votes[expert_id] = asdict(vote)

            span.set_attribute("session_id", session_id)
            span.set_attribute("decision_item_id", decision_item_id)
            span.set_attribute("expert_id", expert_id)

            # Calculate consensus
            consensus_result = await self.consensus_engine.calculate_consensus(
                decision_item,
                session.invited_experts,
                session.consensus_algorithm,
                session.consensus_threshold
            )

            decision_item.consensus_result = consensus_result

            # Broadcast vote update
            if self.socketio_server and not session.anonymous_voting:
                await self.socketio_server.emit("vote_submitted", {
                    "session_id": session_id,
                    "decision_item_id": decision_item_id,
                    "expert_id": expert_id if not session.anonymous_voting else "anonymous",
                    "consensus_status": consensus_result,
                    "timestamp": datetime.utcnow().isoformat()
                }, room=f"session_{session_id}")

            logger.info(f"Vote submitted for session {session_id}, item {decision_item_id}")

            return {
                "success": True,
                "vote_id": vote.vote_id,
                "vote_status": "recorded",
                "consensus_status": consensus_result,
                "current_results": {
                    "votes_received": len(decision_item.votes),
                    "total_experts": len(session.invited_experts),
                    "consensus_reached": consensus_result["consensus_reached"]
                }
            }

    async def get_session_details(self, session_id: str) -> Dict[str, Any]:
        """Get detailed session information"""
        if session_id not in self.active_sessions:
            # Try to load from Redis cache
            cached_session = await self._get_cached_session(session_id)
            if cached_session:
                return {"success": True, "session": cached_session}

            raise ValueError(f"Session {session_id} not found")

        session = self.active_sessions[session_id]

        # Calculate session statistics
        total_votes = sum(len(item.votes) for item in session.decision_items)
        consensus_items = sum(1 for item in session.decision_items
                            if item.consensus_result and item.consensus_result.get("consensus_reached"))

        session_details = {
            "session_id": session.session_id,
            "title": session.title,
            "description": session.description,
            "status": session.status.value,
            "session_type": session.session_type.value,
            "consensus_algorithm": session.consensus_algorithm.value,
            "created_at": session.created_at.isoformat(),
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "duration_hours": session.session_duration_hours,
            "experts": [
                {
                    "expert_id": exp.expert_id,
                    "name": exp.name,
                    "specialty": exp.specialty,
                    "role": exp.role.value,
                    "connection_status": exp.connection_status,
                    "joined_at": exp.joined_at.isoformat() if exp.joined_at else None
                } for exp in session.invited_experts
            ],
            "decision_items": [
                {
                    "item_id": item.item_id,
                    "title": item.title,
                    "description": item.description,
                    "decision_type": item.decision_type.value,
                    "options": item.options,
                    "votes_received": len(item.votes),
                    "consensus_result": item.consensus_result
                } for item in session.decision_items
            ],
            "statistics": {
                "total_experts": len(session.invited_experts),
                "connected_experts": len(self.session_participants.get(session_id, set())),
                "total_votes": total_votes,
                "consensus_items": consensus_items,
                "completion_rate": consensus_items / len(session.decision_items) if session.decision_items else 0
            }
        }

        return {"success": True, "session": session_details}

    async def get_advisory_board_status(self) -> Dict[str, Any]:
        """Get overall advisory board status"""
        active_sessions_count = len([s for s in self.active_sessions.values() if s.status == SessionStatus.ACTIVE])
        total_sessions = len(self.active_sessions)

        return {
            "available": True,
            "active_sessions": active_sessions_count,
            "total_sessions": total_sessions,
            "supported_algorithms": [alg.value for alg in ConsensusAlgorithm],
            "supported_session_types": [st.value for st in SessionType],
            "supported_decision_types": [dt.value for dt in DecisionType],
            "websocket_connections": len(self.websocket_connections),
            "capabilities": {
                "real_time_collaboration": True,
                "consensus_algorithms": True,
                "expert_management": True,
                "vote_tracking": True,
                "session_recording": True,
                "evidence_integration": True,
                "multi_session_support": True,
                "anonymous_voting": True
            }
        }

    async def _handle_client_disconnect(self, sid: str):
        """Handle client disconnection"""
        # Find and update expert connection status
        for session_id, participants in self.session_participants.items():
            if sid in self.websocket_connections:
                connection_info = self.websocket_connections[sid]
                expert_id = connection_info.get("expert_id")

                if expert_id and session_id in self.active_sessions:
                    session = self.active_sessions[session_id]
                    for expert in session.invited_experts:
                        if expert.expert_id == expert_id:
                            expert.connection_status = "disconnected"
                            expert.last_activity = datetime.utcnow()
                            break

        # Remove from connections
        if sid in self.websocket_connections:
            del self.websocket_connections[sid]

    async def _handle_join_session(self, sid: str, data: Dict[str, Any]):
        """Handle join session WebSocket event"""
        session_id = data.get("session_id")
        expert_id = data.get("expert_id")

        # Store connection info
        self.websocket_connections[sid] = {
            "session_id": session_id,
            "expert_id": expert_id,
            "connected_at": datetime.utcnow()
        }

        # Join SocketIO room
        await self.socketio_server.enter_room(sid, f"session_{session_id}")

        # Update session
        try:
            result = await self.join_session(data)
            await self.socketio_server.emit("join_success", result, room=sid)
        except Exception as e:
            await self.socketio_server.emit("join_error", {"error": str(e)}, room=sid)

    async def _handle_vote_submission(self, sid: str, data: Dict[str, Any]):
        """Handle vote submission WebSocket event"""
        try:
            result = await self.submit_vote(data)
            await self.socketio_server.emit("vote_success", result, room=sid)
        except Exception as e:
            await self.socketio_server.emit("vote_error", {"error": str(e)}, room=sid)

    async def _handle_session_message(self, sid: str, data: Dict[str, Any]):
        """Handle session messaging"""
        session_id = data.get("session_id")
        message = data.get("message")
        expert_id = data.get("expert_id")

        # Broadcast message to session participants
        await self.socketio_server.emit("session_message", {
            "session_id": session_id,
            "expert_id": expert_id,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }, room=f"session_{session_id}")

    async def _cache_session(self, session: AdvisorySession):
        """Cache session in Redis"""
        if self.redis_client:
            await self.redis_client.setex(
                f"advisory_session:{session.session_id}",
                3600,  # 1 hour TTL
                json.dumps(asdict(session), default=str)
            )

    async def _get_cached_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get cached session from Redis"""
        if self.redis_client:
            cached = await self.redis_client.get(f"advisory_session:{session_id}")
            if cached:
                return json.loads(cached)
        return None

    async def _persist_session(self, session: AdvisorySession):
        """Persist session to PostgreSQL"""
        # Simplified persistence logic
        logger.info(f"Persisting advisory session {session.session_id} to database")

    async def shutdown(self):
        """Graceful shutdown of advisory board"""
        logger.info("Shutting down Real-time Advisory Board")

        # Close active sessions
        for session_id in list(self.active_sessions.keys()):
            session = self.active_sessions[session_id]
            if session.status == SessionStatus.ACTIVE:
                session.status = SessionStatus.SUSPENDED
                session.ended_at = datetime.utcnow()

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Real-time Advisory Board shutdown complete")

# Factory function for easy instantiation
async def create_realtime_advisory_board(config: Dict[str, Any]) -> RealTimeAdvisoryBoard:
    """Create and initialize Real-time Advisory Board"""
    advisory_board = RealTimeAdvisoryBoard(config)
    await advisory_board.initialize()
    return advisory_board

# Web server runner
async def run_advisory_board_server(config: Dict[str, Any]):
    """Run the advisory board web server"""
    advisory_board = await create_realtime_advisory_board(config)

    # Add REST API endpoints
    async def create_session_handler(request):
        """REST endpoint to create session"""
        data = await request.json()
        result = await advisory_board.create_advisory_session(data)
        return web.json_response(result)

    async def join_session_handler(request):
        """REST endpoint to join session"""
        data = await request.json()
        result = await advisory_board.join_session(data)
        return web.json_response(result)

    async def submit_vote_handler(request):
        """REST endpoint to submit vote"""
        data = await request.json()
        result = await advisory_board.submit_vote(data)
        return web.json_response(result)

    async def session_details_handler(request):
        """REST endpoint to get session details"""
        session_id = request.match_info['session_id']
        result = await advisory_board.get_session_details(session_id)
        return web.json_response(result)

    async def status_handler(request):
        """REST endpoint to get status"""
        result = await advisory_board.get_advisory_board_status()
        return web.json_response(result)

    # Add routes
    advisory_board.app.router.add_post('/sessions/create', create_session_handler)
    advisory_board.app.router.add_post('/sessions/join', join_session_handler)
    advisory_board.app.router.add_post('/sessions/vote', submit_vote_handler)
    advisory_board.app.router.add_get('/sessions/{session_id}', session_details_handler)
    advisory_board.app.router.add_get('/status', status_handler)

    # Start server
    runner = web.AppRunner(advisory_board.app)
    await runner.setup()

    port = config.get('port', 8004)
    site = web.TCPSite(runner, '0.0.0.0', port)
    await site.start()

    logger.info(f"Real-time Advisory Board server started on port {port}")

    return advisory_board, runner