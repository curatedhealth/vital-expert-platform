# ===================================================================
# Real-time Collaboration Service - Phase 2 Enhanced
# WebSocket orchestration with multi-user collaboration
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set, Callable
from enum import Enum
import uuid
from dataclasses import dataclass, asdict, field
import socketio
from aioredis import Redis
import jwt
from sqlalchemy import create_engine, text
import asyncpg
from kafka import KafkaProducer
import opentelemetry.trace as trace
from opentelemetry import metrics

# Configure logging and telemetry
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
active_connections = meter.create_gauge(
    "active_websocket_connections",
    description="Number of active WebSocket connections"
)

collaboration_events = meter.create_counter(
    "collaboration_events_total",
    description="Total collaboration events processed"
)

session_duration = meter.create_histogram(
    "collaboration_session_duration_seconds",
    description="Duration of collaboration sessions"
)

class SessionType(Enum):
    """Types of collaboration sessions"""
    VIRTUAL_ADVISORY_BOARD = "virtual_advisory_board"
    EXPERT_CONSULTATION = "expert_consultation"
    CLINICAL_REVIEW = "clinical_review"
    PEER_COLLABORATION = "peer_collaboration"
    TRAINING_SESSION = "training_session"
    CASE_DISCUSSION = "case_discussion"

class ParticipantRole(Enum):
    """Roles for session participants"""
    MODERATOR = "moderator"
    CLINICAL_EXPERT = "clinical_expert"
    REGULATORY_EXPERT = "regulatory_expert"
    PATIENT_ADVOCATE = "patient_advocate"
    RESEARCHER = "researcher"
    PARTICIPANT = "participant"
    OBSERVER = "observer"

class EventType(Enum):
    """Types of collaboration events"""
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    MESSAGE_SENT = "message_sent"
    VOICE_ACTIVITY = "voice_activity"
    SCREEN_SHARE = "screen_share"
    DOCUMENT_SHARED = "document_shared"
    ANNOTATION_ADDED = "annotation_added"
    POLL_CREATED = "poll_created"
    VOTE_CAST = "vote_cast"
    CONSENSUS_REACHED = "consensus_reached"
    DECISION_MADE = "decision_made"
    SESSION_STATE_CHANGED = "session_state_changed"

class SessionStatus(Enum):
    """Collaboration session statuses"""
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@dataclass
class Participant:
    """Collaboration session participant"""
    user_id: str
    username: str
    role: ParticipantRole
    organization_id: str
    credentials: Dict[str, Any]
    joined_at: datetime
    last_activity: datetime
    is_active: bool = True
    permissions: Set[str] = field(default_factory=set)
    connection_id: Optional[str] = None

@dataclass
class CollaborationEvent:
    """Collaboration event"""
    event_id: str
    session_id: str
    user_id: str
    event_type: EventType
    data: Dict[str, Any]
    timestamp: datetime = datetime.utcnow()
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ConsensusItem:
    """Item for consensus building"""
    item_id: str
    question: str
    options: List[str]
    votes: Dict[str, str]  # user_id -> option
    weights: Dict[str, float]  # user_id -> weight
    consensus_threshold: float = 0.7
    is_resolved: bool = False
    resolution: Optional[str] = None

@dataclass
class CollaborationSession:
    """Real-time collaboration session"""
    session_id: str
    title: str
    session_type: SessionType
    organization_id: str
    moderator_id: str
    participants: Dict[str, Participant]
    status: SessionStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    agenda: List[Dict[str, Any]] = field(default_factory=list)
    documents: List[Dict[str, Any]] = field(default_factory=list)
    events: List[CollaborationEvent] = field(default_factory=list)
    consensus_items: Dict[str, ConsensusItem] = field(default_factory=dict)
    decisions: List[Dict[str, Any]] = field(default_factory=list)
    recordings: List[Dict[str, Any]] = field(default_factory=list)
    settings: Dict[str, Any] = field(default_factory=dict)

class WebSocketManager:
    """WebSocket connection manager"""

    def __init__(self, redis_client: Redis):
        self.redis_client = redis_client
        self.sio = socketio.AsyncServer(
            cors_allowed_origins="*",
            logger=True,
            engineio_logger=True,
            async_mode='asgi'
        )
        self.connections: Dict[str, Dict[str, Any]] = {}  # connection_id -> connection info
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> connection_ids
        self.session_connections: Dict[str, Set[str]] = {}  # session_id -> connection_ids

        # Register event handlers
        self._register_handlers()

    def _register_handlers(self):
        """Register WebSocket event handlers"""

        @self.sio.event
        async def connect(sid, environ, auth):
            """Handle client connection"""
            try:
                # Authenticate connection
                token = auth.get('token') if auth else None
                if not token:
                    logger.warning(f"Connection {sid} rejected: No authentication token")
                    await self.sio.disconnect(sid)
                    return False

                user_info = await self._authenticate_token(token)
                if not user_info:
                    logger.warning(f"Connection {sid} rejected: Invalid token")
                    await self.sio.disconnect(sid)
                    return False

                # Store connection info
                connection_info = {
                    'sid': sid,
                    'user_id': user_info['user_id'],
                    'organization_id': user_info['organization_id'],
                    'username': user_info.get('username', 'Unknown'),
                    'connected_at': datetime.utcnow(),
                    'last_activity': datetime.utcnow()
                }

                self.connections[sid] = connection_info

                # Update user connections mapping
                user_id = user_info['user_id']
                if user_id not in self.user_connections:
                    self.user_connections[user_id] = set()
                self.user_connections[user_id].add(sid)

                # Update metrics
                active_connections.set(len(self.connections))

                logger.info(f"User {user_id} connected with session {sid}")
                return True

            except Exception as e:
                logger.error(f"Connection error: {e}")
                await self.sio.disconnect(sid)
                return False

        @self.sio.event
        async def disconnect(sid):
            """Handle client disconnection"""
            try:
                connection_info = self.connections.get(sid)
                if connection_info:
                    user_id = connection_info['user_id']

                    # Remove from user connections
                    if user_id in self.user_connections:
                        self.user_connections[user_id].discard(sid)
                        if not self.user_connections[user_id]:
                            del self.user_connections[user_id]

                    # Remove from session connections
                    for session_id, sids in list(self.session_connections.items()):
                        if sid in sids:
                            sids.discard(sid)
                            if not sids:
                                del self.session_connections[session_id]

                    # Remove connection
                    del self.connections[sid]

                    # Update metrics
                    active_connections.set(len(self.connections))

                    logger.info(f"User {user_id} disconnected from session {sid}")

            except Exception as e:
                logger.error(f"Disconnection error: {e}")

        @self.sio.event
        async def join_session(sid, data):
            """Handle joining a collaboration session"""
            try:
                session_id = data.get('session_id')
                if not session_id:
                    await self.sio.emit('error', {'message': 'Session ID required'}, to=sid)
                    return

                connection_info = self.connections.get(sid)
                if not connection_info:
                    await self.sio.emit('error', {'message': 'Invalid connection'}, to=sid)
                    return

                # Join session room
                await self.sio.enter_room(sid, f"session_{session_id}")

                # Update session connections
                if session_id not in self.session_connections:
                    self.session_connections[session_id] = set()
                self.session_connections[session_id].add(sid)

                # Notify others in session
                await self.sio.emit('user_joined', {
                    'user_id': connection_info['user_id'],
                    'username': connection_info['username'],
                    'timestamp': datetime.utcnow().isoformat()
                }, room=f"session_{session_id}", skip_sid=sid)

                await self.sio.emit('session_joined', {
                    'session_id': session_id,
                    'message': 'Successfully joined session'
                }, to=sid)

                logger.info(f"User {connection_info['user_id']} joined session {session_id}")

            except Exception as e:
                logger.error(f"Join session error: {e}")
                await self.sio.emit('error', {'message': str(e)}, to=sid)

        @self.sio.event
        async def leave_session(sid, data):
            """Handle leaving a collaboration session"""
            try:
                session_id = data.get('session_id')
                if not session_id:
                    return

                connection_info = self.connections.get(sid)
                if not connection_info:
                    return

                # Leave session room
                await self.sio.leave_room(sid, f"session_{session_id}")

                # Update session connections
                if session_id in self.session_connections:
                    self.session_connections[session_id].discard(sid)
                    if not self.session_connections[session_id]:
                        del self.session_connections[session_id]

                # Notify others in session
                await self.sio.emit('user_left', {
                    'user_id': connection_info['user_id'],
                    'username': connection_info['username'],
                    'timestamp': datetime.utcnow().isoformat()
                }, room=f"session_{session_id}")

                logger.info(f"User {connection_info['user_id']} left session {session_id}")

            except Exception as e:
                logger.error(f"Leave session error: {e}")

        @self.sio.event
        async def send_message(sid, data):
            """Handle sending messages in session"""
            try:
                session_id = data.get('session_id')
                message = data.get('message')
                message_type = data.get('type', 'text')

                if not session_id or not message:
                    await self.sio.emit('error', {'message': 'Session ID and message required'}, to=sid)
                    return

                connection_info = self.connections.get(sid)
                if not connection_info:
                    await self.sio.emit('error', {'message': 'Invalid connection'}, to=sid)
                    return

                # Create message event
                message_event = {
                    'event_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'user_id': connection_info['user_id'],
                    'username': connection_info['username'],
                    'message': message,
                    'type': message_type,
                    'timestamp': datetime.utcnow().isoformat()
                }

                # Broadcast to session
                await self.sio.emit('message_received', message_event, room=f"session_{session_id}")

                # Update metrics
                collaboration_events.add(1, {"event_type": "message_sent"})

                logger.info(f"Message sent in session {session_id} by user {connection_info['user_id']}")

            except Exception as e:
                logger.error(f"Send message error: {e}")
                await self.sio.emit('error', {'message': str(e)}, to=sid)

        @self.sio.event
        async def cast_vote(sid, data):
            """Handle voting in consensus building"""
            try:
                session_id = data.get('session_id')
                item_id = data.get('item_id')
                vote = data.get('vote')

                if not all([session_id, item_id, vote]):
                    await self.sio.emit('error', {'message': 'Session ID, item ID, and vote required'}, to=sid)
                    return

                connection_info = self.connections.get(sid)
                if not connection_info:
                    await self.sio.emit('error', {'message': 'Invalid connection'}, to=sid)
                    return

                # Create vote event
                vote_event = {
                    'event_id': str(uuid.uuid4()),
                    'session_id': session_id,
                    'item_id': item_id,
                    'user_id': connection_info['user_id'],
                    'username': connection_info['username'],
                    'vote': vote,
                    'timestamp': datetime.utcnow().isoformat()
                }

                # Broadcast to session
                await self.sio.emit('vote_cast', vote_event, room=f"session_{session_id}")

                # Update metrics
                collaboration_events.add(1, {"event_type": "vote_cast"})

                logger.info(f"Vote cast in session {session_id} by user {connection_info['user_id']}")

            except Exception as e:
                logger.error(f"Cast vote error: {e}")
                await self.sio.emit('error', {'message': str(e)}, to=sid)

    async def _authenticate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Authenticate JWT token"""
        try:
            # In production, this would verify JWT with proper secret
            # For now, simulate token validation
            payload = {
                'user_id': 'user_123',
                'organization_id': 'org_456',
                'username': 'clinical_expert'
            }
            return payload
        except Exception as e:
            logger.error(f"Token authentication error: {e}")
            return None

    async def broadcast_to_session(self, session_id: str, event: str, data: Dict[str, Any]):
        """Broadcast message to all participants in a session"""
        await self.sio.emit(event, data, room=f"session_{session_id}")

    async def send_to_user(self, user_id: str, event: str, data: Dict[str, Any]):
        """Send message to specific user (all their connections)"""
        connection_sids = self.user_connections.get(user_id, set())
        for sid in connection_sids:
            await self.sio.emit(event, data, to=sid)

    def get_session_participants(self, session_id: str) -> List[Dict[str, Any]]:
        """Get list of active participants in session"""
        participants = []
        session_sids = self.session_connections.get(session_id, set())

        for sid in session_sids:
            connection_info = self.connections.get(sid)
            if connection_info:
                participants.append({
                    'user_id': connection_info['user_id'],
                    'username': connection_info['username'],
                    'connected_at': connection_info['connected_at'].isoformat(),
                    'last_activity': connection_info['last_activity'].isoformat()
                })

        return participants

class ConsensusEngine:
    """Consensus building and decision-making engine"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.algorithms = {
            'simple_majority': self._simple_majority,
            'weighted_voting': self._weighted_voting,
            'consensus_threshold': self._consensus_threshold,
            'expert_weighted': self._expert_weighted
        }

    async def create_consensus_item(self, session_id: str, question: str,
                                  options: List[str], algorithm: str = 'weighted_voting',
                                  threshold: float = 0.7) -> ConsensusItem:
        """Create new consensus item"""
        item = ConsensusItem(
            item_id=str(uuid.uuid4()),
            question=question,
            options=options,
            votes={},
            weights={},
            consensus_threshold=threshold
        )

        return item

    async def cast_vote(self, item: ConsensusItem, user_id: str, vote: str,
                       weight: float = 1.0) -> ConsensusItem:
        """Cast vote for consensus item"""
        if vote not in item.options:
            raise ValueError(f"Invalid vote option: {vote}")

        item.votes[user_id] = vote
        item.weights[user_id] = weight

        # Check if consensus reached
        consensus_result = await self._calculate_consensus(item, 'weighted_voting')
        if consensus_result['consensus_reached']:
            item.is_resolved = True
            item.resolution = consensus_result['winning_option']

        return item

    async def _calculate_consensus(self, item: ConsensusItem,
                                 algorithm: str) -> Dict[str, Any]:
        """Calculate consensus using specified algorithm"""
        consensus_func = self.algorithms.get(algorithm, self._weighted_voting)
        return await consensus_func(item)

    async def _simple_majority(self, item: ConsensusItem) -> Dict[str, Any]:
        """Simple majority consensus"""
        if not item.votes:
            return {'consensus_reached': False, 'results': {}}

        vote_counts = {}
        for vote in item.votes.values():
            vote_counts[vote] = vote_counts.get(vote, 0) + 1

        total_votes = len(item.votes)
        majority_threshold = total_votes / 2

        winning_option = max(vote_counts.items(), key=lambda x: x[1])
        consensus_reached = winning_option[1] > majority_threshold

        return {
            'consensus_reached': consensus_reached,
            'winning_option': winning_option[0] if consensus_reached else None,
            'vote_counts': vote_counts,
            'total_votes': total_votes,
            'algorithm': 'simple_majority'
        }

    async def _weighted_voting(self, item: ConsensusItem) -> Dict[str, Any]:
        """Weighted voting consensus"""
        if not item.votes:
            return {'consensus_reached': False, 'results': {}}

        weighted_counts = {}
        total_weight = 0

        for user_id, vote in item.votes.items():
            weight = item.weights.get(user_id, 1.0)
            weighted_counts[vote] = weighted_counts.get(vote, 0) + weight
            total_weight += weight

        if total_weight == 0:
            return {'consensus_reached': False, 'results': {}}

        # Calculate percentages
        vote_percentages = {
            option: (count / total_weight) * 100
            for option, count in weighted_counts.items()
        }

        winning_option = max(vote_percentages.items(), key=lambda x: x[1])
        consensus_reached = winning_option[1] >= (item.consensus_threshold * 100)

        return {
            'consensus_reached': consensus_reached,
            'winning_option': winning_option[0] if consensus_reached else None,
            'vote_percentages': vote_percentages,
            'weighted_counts': weighted_counts,
            'total_weight': total_weight,
            'algorithm': 'weighted_voting'
        }

    async def _consensus_threshold(self, item: ConsensusItem) -> Dict[str, Any]:
        """Consensus threshold algorithm"""
        return await self._weighted_voting(item)  # Same as weighted voting

    async def _expert_weighted(self, item: ConsensusItem) -> Dict[str, Any]:
        """Expert-weighted consensus (higher weights for experts)"""
        # Modify weights based on user roles/expertise
        # This would integrate with user credential system
        return await self._weighted_voting(item)

class RealtimeCollaborationService:
    """Main real-time collaboration service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.redis_client = None
        self.postgres_pool = None
        self.kafka_producer = None
        self.websocket_manager = None
        self.consensus_engine = ConsensusEngine(config.get('consensus_config', {}))
        self.active_sessions: Dict[str, CollaborationSession] = {}

    async def initialize(self):
        """Initialize collaboration service"""
        # Initialize Redis
        redis_config = self.config.get('redis_config', {})
        self.redis_client = Redis(
            host=redis_config.get('host', 'localhost'),
            port=redis_config.get('port', 6379),
            decode_responses=True
        )

        # Initialize WebSocket manager
        self.websocket_manager = WebSocketManager(self.redis_client)

        # Initialize PostgreSQL
        postgres_url = self.config.get('postgres_url')
        if postgres_url:
            self.postgres_pool = await asyncpg.create_pool(postgres_url)

        # Initialize Kafka
        kafka_config = self.config.get('kafka_config', {})
        if kafka_config:
            self.kafka_producer = KafkaProducer(
                bootstrap_servers=kafka_config.get('bootstrap_servers', ['localhost:9092']),
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )

        logger.info("Real-time Collaboration Service initialized")

    async def create_session(self, title: str, session_type: SessionType,
                           organization_id: str, moderator_id: str,
                           agenda: List[Dict[str, Any]] = None) -> CollaborationSession:
        """Create new collaboration session"""
        with tracer.start_as_current_span("create_collaboration_session") as span:
            session_id = str(uuid.uuid4())

            session = CollaborationSession(
                session_id=session_id,
                title=title,
                session_type=session_type,
                organization_id=organization_id,
                moderator_id=moderator_id,
                participants={},
                status=SessionStatus.SCHEDULED,
                created_at=datetime.utcnow(),
                agenda=agenda or []
            )

            self.active_sessions[session_id] = session

            # Persist to database
            await self._persist_session(session)

            # Publish event
            if self.kafka_producer:
                event = {
                    'event_type': 'session_created',
                    'session_id': session_id,
                    'session_type': session_type.value,
                    'organization_id': organization_id,
                    'timestamp': datetime.utcnow().isoformat()
                }
                self.kafka_producer.send('collaboration-events', event)

            span.set_attribute("session_id", session_id)
            span.set_attribute("session_type", session_type.value)

            logger.info(f"Created collaboration session {session_id}")
            return session

    async def start_session(self, session_id: str, moderator_id: str) -> bool:
        """Start collaboration session"""
        session = self.active_sessions.get(session_id)
        if not session:
            logger.error(f"Session {session_id} not found")
            return False

        if session.moderator_id != moderator_id:
            logger.error(f"User {moderator_id} not authorized to start session {session_id}")
            return False

        session.status = SessionStatus.ACTIVE
        session.started_at = datetime.utcnow()

        # Notify all participants
        await self.websocket_manager.broadcast_to_session(
            session_id,
            'session_started',
            {
                'session_id': session_id,
                'started_at': session.started_at.isoformat(),
                'agenda': session.agenda
            }
        )

        # Update metrics
        collaboration_events.add(1, {"event_type": "session_started"})

        logger.info(f"Started collaboration session {session_id}")
        return True

    async def add_participant(self, session_id: str, user_id: str, username: str,
                            role: ParticipantRole, organization_id: str,
                            credentials: Dict[str, Any] = None) -> bool:
        """Add participant to session"""
        session = self.active_sessions.get(session_id)
        if not session:
            return False

        participant = Participant(
            user_id=user_id,
            username=username,
            role=role,
            organization_id=organization_id,
            credentials=credentials or {},
            joined_at=datetime.utcnow(),
            last_activity=datetime.utcnow()
        )

        session.participants[user_id] = participant

        # Notify session participants
        await self.websocket_manager.broadcast_to_session(
            session_id,
            'participant_added',
            {
                'user_id': user_id,
                'username': username,
                'role': role.value,
                'joined_at': participant.joined_at.isoformat()
            }
        )

        logger.info(f"Added participant {user_id} to session {session_id}")
        return True

    async def create_consensus_item(self, session_id: str, moderator_id: str,
                                  question: str, options: List[str]) -> Optional[str]:
        """Create consensus item for session"""
        session = self.active_sessions.get(session_id)
        if not session or session.moderator_id != moderator_id:
            return None

        item = await self.consensus_engine.create_consensus_item(
            session_id, question, options
        )

        session.consensus_items[item.item_id] = item

        # Notify participants
        await self.websocket_manager.broadcast_to_session(
            session_id,
            'consensus_item_created',
            {
                'item_id': item.item_id,
                'question': question,
                'options': options,
                'created_at': datetime.utcnow().isoformat()
            }
        )

        logger.info(f"Created consensus item {item.item_id} in session {session_id}")
        return item.item_id

    async def cast_vote(self, session_id: str, item_id: str, user_id: str,
                       vote: str) -> bool:
        """Cast vote for consensus item"""
        session = self.active_sessions.get(session_id)
        if not session:
            return False

        item = session.consensus_items.get(item_id)
        if not item or item.is_resolved:
            return False

        participant = session.participants.get(user_id)
        if not participant:
            return False

        # Determine vote weight based on role
        weight = self._get_vote_weight(participant.role)

        try:
            updated_item = await self.consensus_engine.cast_vote(item, user_id, vote, weight)
            session.consensus_items[item_id] = updated_item

            # Notify session
            await self.websocket_manager.broadcast_to_session(
                session_id,
                'vote_cast',
                {
                    'item_id': item_id,
                    'user_id': user_id,
                    'vote': vote,
                    'is_resolved': updated_item.is_resolved,
                    'resolution': updated_item.resolution
                }
            )

            if updated_item.is_resolved:
                # Record decision
                decision = {
                    'decision_id': str(uuid.uuid4()),
                    'item_id': item_id,
                    'question': updated_item.question,
                    'resolution': updated_item.resolution,
                    'votes': dict(updated_item.votes),
                    'decided_at': datetime.utcnow().isoformat()
                }
                session.decisions.append(decision)

                await self.websocket_manager.broadcast_to_session(
                    session_id,
                    'consensus_reached',
                    {
                        'item_id': item_id,
                        'resolution': updated_item.resolution,
                        'decision': decision
                    }
                )

            return True

        except ValueError as e:
            logger.error(f"Vote casting error: {e}")
            return False

    def _get_vote_weight(self, role: ParticipantRole) -> float:
        """Get vote weight based on participant role"""
        weights = {
            ParticipantRole.MODERATOR: 2.0,
            ParticipantRole.CLINICAL_EXPERT: 1.5,
            ParticipantRole.REGULATORY_EXPERT: 1.5,
            ParticipantRole.RESEARCHER: 1.2,
            ParticipantRole.PATIENT_ADVOCATE: 1.0,
            ParticipantRole.PARTICIPANT: 1.0,
            ParticipantRole.OBSERVER: 0.5
        }
        return weights.get(role, 1.0)

    async def end_session(self, session_id: str, moderator_id: str) -> Dict[str, Any]:
        """End collaboration session"""
        session = self.active_sessions.get(session_id)
        if not session or session.moderator_id != moderator_id:
            return {'success': False, 'error': 'Unauthorized or session not found'}

        session.status = SessionStatus.COMPLETED
        session.ended_at = datetime.utcnow()

        # Calculate session metrics
        duration = (session.ended_at - session.started_at).total_seconds() if session.started_at else 0
        session_duration.record(duration)

        # Generate session summary
        summary = {
            'session_id': session_id,
            'title': session.title,
            'duration_seconds': duration,
            'participant_count': len(session.participants),
            'decisions_made': len(session.decisions),
            'consensus_items': len(session.consensus_items),
            'events_count': len(session.events),
            'ended_at': session.ended_at.isoformat()
        }

        # Notify participants
        await self.websocket_manager.broadcast_to_session(
            session_id,
            'session_ended',
            summary
        )

        # Archive session
        await self._archive_session(session)

        logger.info(f"Ended collaboration session {session_id}")
        return {'success': True, 'summary': summary}

    async def _persist_session(self, session: CollaborationSession):
        """Persist session to database"""
        if self.postgres_pool:
            try:
                async with self.postgres_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO collaboration_sessions
                        (session_id, title, session_type, organization_id, moderator_id,
                         status, created_at, agenda, settings)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        """,
                        session.session_id, session.title, session.session_type.value,
                        session.organization_id, session.moderator_id,
                        session.status.value, session.created_at,
                        json.dumps(session.agenda), json.dumps(session.settings)
                    )
            except Exception as e:
                logger.error(f"Failed to persist session: {e}")

    async def _archive_session(self, session: CollaborationSession):
        """Archive completed session"""
        if self.postgres_pool:
            try:
                async with self.postgres_pool.acquire() as conn:
                    # Update session record
                    await conn.execute(
                        """
                        UPDATE collaboration_sessions
                        SET status = $1, ended_at = $2,
                            participants = $3, decisions = $4, events = $5
                        WHERE session_id = $6
                        """,
                        session.status.value, session.ended_at,
                        json.dumps({uid: asdict(p) for uid, p in session.participants.items()}, default=str),
                        json.dumps(session.decisions, default=str),
                        json.dumps([asdict(e) for e in session.events], default=str),
                        session.session_id
                    )

                    logger.info(f"Archived session {session.session_id}")
            except Exception as e:
                logger.error(f"Failed to archive session: {e}")

    def get_websocket_app(self):
        """Get WebSocket ASGI app"""
        return socketio.ASGIApp(self.websocket_manager.sio)

    async def get_session_analytics(self, session_id: str) -> Dict[str, Any]:
        """Get session analytics and metrics"""
        session = self.active_sessions.get(session_id)
        if not session:
            return {}

        active_participants = self.websocket_manager.get_session_participants(session_id)

        return {
            'session_id': session_id,
            'status': session.status.value,
            'participant_count': len(session.participants),
            'active_participants': len(active_participants),
            'decisions_made': len(session.decisions),
            'consensus_items': len(session.consensus_items),
            'events_count': len(session.events),
            'duration': (datetime.utcnow() - session.started_at).total_seconds() if session.started_at else 0,
            'active_connections': active_participants
        }

    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Real-time Collaboration Service")

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        if self.kafka_producer:
            self.kafka_producer.close()

        logger.info("Real-time Collaboration Service shutdown complete")

# Factory function
async def create_collaboration_service(config: Dict[str, Any]) -> RealtimeCollaborationService:
    """Create and initialize Real-time Collaboration Service"""
    service = RealtimeCollaborationService(config)
    await service.initialize()
    return service