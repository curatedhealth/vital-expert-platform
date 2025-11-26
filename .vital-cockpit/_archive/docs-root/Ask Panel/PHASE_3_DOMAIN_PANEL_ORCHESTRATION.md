# 🎭 Phase 3: Domain Layer & Panel Orchestration
## Complete Implementation Guide - Panel Aggregate, Strategies & LangGraph Workflows

**Duration**: 7-10 days  
**Complexity**: High  
**Prerequisites**: Phase 2 complete (Infrastructure layer)  
**Next Phase**: Phase 4 - API Layer & Real-time Streaming

---

## 📋 Overview

Phase 3 implements the **core domain logic** for Ask Panel service: the Panel aggregate root, 6 orchestration strategies, LangGraph state machines, and consensus algorithms. This is the heart of the multi-expert AI discussion system.

### What You'll Build

```
┌─────────────────────────────────────────────────────────┐
│              PANEL ORCHESTRATION SYSTEM                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐ │
│  │Panel         │   │ 6 Panel      │   │ LangGraph  │ │
│  │Aggregate     │──▶│ Strategies   │──▶│ Workflows  │ │
│  │(DDD)         │   │              │   │            │ │
│  └──────────────┘   └──────────────┘   └────────────┘ │
│         │                   │                  │       │
│         ▼                   ▼                  ▼       │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐ │
│  │Consensus     │   │Quantum       │   │Expert      │ │
│  │Builder       │   │Consensus     │   │Agents      │ │
│  └──────────────┘   └──────────────┘   └────────────┘ │
│                                                         │
│  TENANT-AWARE: Every operation includes tenant context │
└─────────────────────────────────────────────────────────┘
```

### Phase 3 Components

**3.1** - Panel Domain Model (Aggregate Root + Value Objects)  
**3.2** - Panel Strategy Interface + 6 Implementations  
**3.3** - LangGraph State Machines for Panel Workflows  
**3.4** - Consensus Algorithms (Standard + Quantum)  
**3.5** - Panel Repository with Multi-Tenant Security  

---

## 📦 Complete Implementation

Copy each prompt to Cursor AI in order. Each builds on the previous.

---

## PROMPT 3.1: Panel Domain Model (Aggregate Root)

**Copy this entire section to Cursor AI:**

```
TASK: Create Panel Aggregate Root following Domain-Driven Design patterns

CONTEXT:
Building the core domain model for Ask Panel service. The Panel is the aggregate root
that orchestrates multi-expert AI discussions with full tenant isolation.

REQUIREMENTS:
Domain Model with:
- Panel aggregate root (DDD pattern)
- Value objects: PanelId, PanelType, PanelStatus, ConsensusResult
- Rich domain behavior (not anemic model)
- Tenant context embedded in all operations
- Domain events for state changes
- Validation rules enforced

LOCATION: services/ask-panel-service/src/domain/

CREATE FILES:

1. models/panel_id.py

```python
"""Panel ID Value Object - Unique identifier for panels"""

from dataclasses import dataclass
import uuid
from typing import Union


@dataclass(frozen=True)
class PanelId:
    """
    Value object representing a unique panel identifier.
    
    Immutable, comparable, and type-safe.
    Always includes tenant context for security.
    """
    value: str
    
    def __post_init__(self):
        """Validate panel ID format"""
        if not self.value:
            raise ValueError("Panel ID cannot be empty")
        
        # Must be valid UUID
        try:
            uuid.UUID(self.value)
        except ValueError:
            raise ValueError(f"Invalid Panel ID format: {self.value}")
    
    @classmethod
    def generate(cls) -> 'PanelId':
        """Generate a new random panel ID"""
        return cls(str(uuid.uuid4()))
    
    @classmethod
    def from_string(cls, value: str) -> 'PanelId':
        """Create from string, validating format"""
        return cls(value)
    
    def __str__(self) -> str:
        return self.value
    
    def __repr__(self) -> str:
        return f"PanelId('{self.value}')"


# Type alias for convenience
PanelIdType = Union[PanelId, str]


def to_panel_id(value: PanelIdType) -> PanelId:
    """Convert string or PanelId to PanelId"""
    if isinstance(value, PanelId):
        return value
    return PanelId.from_string(value)
```

2. models/panel_type.py

```python
"""Panel Type Value Object - Defines orchestration strategy"""

from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any


class PanelTypeEnum(str, Enum):
    """Available panel orchestration types"""
    STRUCTURED = "structured"
    OPEN = "open"
    SOCRATIC = "socratic"
    ADVERSARIAL = "adversarial"
    DELPHI = "delphi"
    HYBRID = "hybrid"


@dataclass(frozen=True)
class PanelType:
    """
    Value object representing panel orchestration type.
    
    Each type has different:
    - Expert selection strategy
    - Discussion flow pattern
    - Consensus building approach
    - Expected duration
    """
    value: PanelTypeEnum
    
    @classmethod
    def from_string(cls, value: str) -> 'PanelType':
        """Create from string"""
        try:
            return cls(PanelTypeEnum(value.lower()))
        except ValueError:
            valid = [t.value for t in PanelTypeEnum]
            raise ValueError(
                f"Invalid panel type: {value}. "
                f"Must be one of: {', '.join(valid)}"
            )
    
    @property
    def name(self) -> str:
        """Human-readable name"""
        return self.value.value.title()
    
    @property
    def description(self) -> str:
        """Description of panel type"""
        descriptions = {
            PanelTypeEnum.STRUCTURED: "Sequential moderated discussion for regulatory strategy",
            PanelTypeEnum.OPEN: "Parallel collaborative exploration for brainstorming",
            PanelTypeEnum.SOCRATIC: "Iterative questioning methodology for deep analysis",
            PanelTypeEnum.ADVERSARIAL: "Structured debate format for risk assessment",
            PanelTypeEnum.DELPHI: "Anonymous iterative rounds for consensus building",
            PanelTypeEnum.HYBRID: "Combined human + AI experts for critical decisions"
        }
        return descriptions[self.value]
    
    @property
    def recommended_experts(self) -> tuple[int, int]:
        """Recommended min/max expert count"""
        ranges = {
            PanelTypeEnum.STRUCTURED: (3, 5),
            PanelTypeEnum.OPEN: (5, 8),
            PanelTypeEnum.SOCRATIC: (3, 4),
            PanelTypeEnum.ADVERSARIAL: (4, 6),
            PanelTypeEnum.DELPHI: (5, 12),
            PanelTypeEnum.HYBRID: (3, 8)
        }
        return ranges[self.value]
    
    @property
    def estimated_duration_minutes(self) -> tuple[int, int]:
        """Estimated duration range in minutes"""
        durations = {
            PanelTypeEnum.STRUCTURED: (10, 15),
            PanelTypeEnum.OPEN: (5, 10),
            PanelTypeEnum.SOCRATIC: (15, 20),
            PanelTypeEnum.ADVERSARIAL: (10, 15),
            PanelTypeEnum.DELPHI: (15, 25),
            PanelTypeEnum.HYBRID: (20, 30)
        }
        return durations[self.value]
    
    def __str__(self) -> str:
        return self.value.value
    
    def __repr__(self) -> str:
        return f"PanelType({self.value.value})"


# Convenience constants
STRUCTURED = PanelType(PanelTypeEnum.STRUCTURED)
OPEN = PanelType(PanelTypeEnum.OPEN)
SOCRATIC = PanelType(PanelTypeEnum.SOCRATIC)
ADVERSARIAL = PanelType(PanelTypeEnum.ADVERSARIAL)
DELPHI = PanelType(PanelTypeEnum.DELPHI)
HYBRID = PanelType(PanelTypeEnum.HYBRID)
```

3. models/panel_status.py

```python
"""Panel Status Value Object - Lifecycle state"""

from enum import Enum
from dataclasses import dataclass
from typing import List


class PanelStatusEnum(str, Enum):
    """Panel lifecycle states"""
    DRAFT = "draft"
    INITIALIZING = "initializing"
    IN_PROGRESS = "in_progress"
    BUILDING_CONSENSUS = "building_consensus"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class PanelStatus:
    """
    Value object representing panel status.
    
    Enforces valid state transitions.
    """
    value: PanelStatusEnum
    
    @classmethod
    def from_string(cls, value: str) -> 'PanelStatus':
        """Create from string"""
        try:
            return cls(PanelStatusEnum(value.lower()))
        except ValueError:
            valid = [s.value for s in PanelStatusEnum]
            raise ValueError(
                f"Invalid status: {value}. "
                f"Must be one of: {', '.join(valid)}"
            )
    
    def can_transition_to(self, new_status: 'PanelStatus') -> bool:
        """Check if transition to new status is valid"""
        valid_transitions = {
            PanelStatusEnum.DRAFT: [
                PanelStatusEnum.INITIALIZING,
                PanelStatusEnum.CANCELLED
            ],
            PanelStatusEnum.INITIALIZING: [
                PanelStatusEnum.IN_PROGRESS,
                PanelStatusEnum.FAILED,
                PanelStatusEnum.CANCELLED
            ],
            PanelStatusEnum.IN_PROGRESS: [
                PanelStatusEnum.BUILDING_CONSENSUS,
                PanelStatusEnum.FAILED,
                PanelStatusEnum.CANCELLED
            ],
            PanelStatusEnum.BUILDING_CONSENSUS: [
                PanelStatusEnum.COMPLETED,
                PanelStatusEnum.FAILED
            ],
            PanelStatusEnum.COMPLETED: [],  # Terminal state
            PanelStatusEnum.FAILED: [],     # Terminal state
            PanelStatusEnum.CANCELLED: []   # Terminal state
        }
        
        return new_status.value in valid_transitions[self.value]
    
    @property
    def is_terminal(self) -> bool:
        """Check if this is a terminal state"""
        return self.value in [
            PanelStatusEnum.COMPLETED,
            PanelStatusEnum.FAILED,
            PanelStatusEnum.CANCELLED
        ]
    
    @property
    def is_active(self) -> bool:
        """Check if panel is actively processing"""
        return self.value in [
            PanelStatusEnum.INITIALIZING,
            PanelStatusEnum.IN_PROGRESS,
            PanelStatusEnum.BUILDING_CONSENSUS
        ]
    
    def __str__(self) -> str:
        return self.value.value
    
    def __repr__(self) -> str:
        return f"PanelStatus({self.value.value})"


# Convenience constants
DRAFT = PanelStatus(PanelStatusEnum.DRAFT)
INITIALIZING = PanelStatus(PanelStatusEnum.INITIALIZING)
IN_PROGRESS = PanelStatus(PanelStatusEnum.IN_PROGRESS)
BUILDING_CONSENSUS = PanelStatus(PanelStatusEnum.BUILDING_CONSENSUS)
COMPLETED = PanelStatus(PanelStatusEnum.COMPLETED)
FAILED = PanelStatus(PanelStatusEnum.FAILED)
CANCELLED = PanelStatus(PanelStatusEnum.CANCELLED)
```

4. models/consensus_result.py

```python
"""Consensus Result Value Object"""

from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime


@dataclass(frozen=True)
class DissentingOpinion:
    """Represents a minority opinion"""
    agent_id: str
    agent_name: str
    opinion: str
    reasoning: str
    confidence: float


@dataclass(frozen=True)
class ConsensusResult:
    """
    Value object representing panel consensus result.
    
    Immutable snapshot of agreement level and recommendations.
    """
    level: float  # 0.0 to 1.0
    recommendation: str
    reasoning: str
    confidence: float  # 0.0 to 1.0
    dimensions: Dict[str, float]  # Multi-dimensional scores
    dissenting_opinions: List[DissentingOpinion]
    calculated_at: datetime
    method: str  # "quantum", "standard", "weighted"
    
    def __post_init__(self):
        """Validate consensus result"""
        if not 0 <= self.level <= 1:
            raise ValueError("Consensus level must be between 0 and 1")
        
        if not 0 <= self.confidence <= 1:
            raise ValueError("Confidence must be between 0 and 1")
        
        if not self.recommendation:
            raise ValueError("Recommendation cannot be empty")
    
    @property
    def has_strong_consensus(self) -> bool:
        """Check if consensus is strong (>0.7)"""
        return self.level >= 0.7
    
    @property
    def has_dissent(self) -> bool:
        """Check if there are dissenting opinions"""
        return len(self.dissenting_opinions) > 0
    
    @property
    def agreement_percentage(self) -> float:
        """Get agreement as percentage"""
        return self.level * 100
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization"""
        return {
            "level": self.level,
            "recommendation": self.recommendation,
            "reasoning": self.reasoning,
            "confidence": self.confidence,
            "dimensions": self.dimensions,
            "dissenting_opinions": [
                {
                    "agent_id": d.agent_id,
                    "agent_name": d.agent_name,
                    "opinion": d.opinion,
                    "reasoning": d.reasoning,
                    "confidence": d.confidence
                }
                for d in self.dissenting_opinions
            ],
            "calculated_at": self.calculated_at.isoformat(),
            "method": self.method,
            "agreement_percentage": self.agreement_percentage
        }
```

5. models/panel.py (Aggregate Root)

```python
"""Panel Aggregate Root - Core domain model"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional, Any
import logging

from vital_shared_kernel.multi_tenant import TenantId, TenantContext

from .panel_id import PanelId
from .panel_type import PanelType
from .panel_status import PanelStatus, DRAFT, IN_PROGRESS, COMPLETED, FAILED
from .consensus_result import ConsensusResult

logger = logging.getLogger(__name__)


@dataclass
class PanelMember:
    """Expert agent participating in panel"""
    agent_id: str
    agent_name: str
    agent_role: str
    added_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class PanelMessage:
    """Message in panel discussion"""
    agent_id: str
    agent_name: str
    content: str
    timestamp: datetime
    round_number: int
    message_type: str = "response"  # response, question, critique


@dataclass
class PanelDiscussion:
    """A round of discussion"""
    round_number: int
    started_at: datetime
    completed_at: Optional[datetime]
    messages: List[PanelMessage] = field(default_factory=list)
    
    def add_message(self, message: PanelMessage):
        """Add message to discussion"""
        self.messages.append(message)
    
    def complete(self):
        """Mark discussion round as complete"""
        self.completed_at = datetime.utcnow()


@dataclass
class Panel:
    """
    Panel Aggregate Root - Orchestrates multi-expert AI discussions.
    
    This is the core domain entity following DDD patterns.
    All business logic and invariants are enforced here.
    """
    # Identity
    panel_id: PanelId
    tenant_id: TenantId
    
    # Core attributes
    query: str
    panel_type: PanelType
    status: PanelStatus = field(default=DRAFT)
    
    # Experts and discussions
    members: List[PanelMember] = field(default_factory=list)
    discussions: List[PanelDiscussion] = field(default_factory=list)
    
    # Results
    consensus: Optional[ConsensusResult] = None
    final_recommendation: Optional[str] = None
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Configuration
    configuration: Dict[str, Any] = field(default_factory=dict)
    
    # Tracking
    _domain_events: List[Dict[str, Any]] = field(default_factory=list, repr=False)
    
    def __post_init__(self):
        """Validate panel invariants"""
        self._validate_query()
        self._validate_tenant_context()
    
    def _validate_query(self):
        """Ensure query is valid"""
        if not self.query or len(self.query.strip()) == 0:
            raise ValueError("Panel query cannot be empty")
        
        if len(self.query) > 5000:
            raise ValueError("Panel query too long (max 5000 characters)")
    
    def _validate_tenant_context(self):
        """Ensure tenant context matches"""
        current_tenant = TenantContext.get()
        if current_tenant != self.tenant_id:
            raise ValueError(
                f"Tenant mismatch: Panel belongs to {self.tenant_id}, "
                f"but current context is {current_tenant}"
            )
    
    # === Business Logic ===
    
    def add_member(self, agent_id: str, agent_name: str, agent_role: str) -> None:
        """Add expert to panel"""
        self._validate_tenant_context()
        
        # Check if already added
        if any(m.agent_id == agent_id for m in self.members):
            raise ValueError(f"Agent {agent_id} already in panel")
        
        # Validate expert count for panel type
        min_experts, max_experts = self.panel_type.recommended_experts
        if len(self.members) >= max_experts:
            raise ValueError(
                f"Panel type {self.panel_type} allows maximum {max_experts} experts"
            )
        
        member = PanelMember(
            agent_id=agent_id,
            agent_name=agent_name,
            agent_role=agent_role
        )
        self.members.append(member)
        self._update_timestamp()
        
        self._add_event("member_added", {
            "agent_id": agent_id,
            "agent_name": agent_name,
            "total_members": len(self.members)
        })
        
        logger.info(
            f"Member added to panel",
            extra={
                "tenant_id": str(self.tenant_id),
                "panel_id": str(self.panel_id),
                "agent_id": agent_id,
                "total_members": len(self.members)
            }
        )
    
    def start_discussion_round(self, round_number: int) -> PanelDiscussion:
        """Start a new discussion round"""
        self._validate_tenant_context()
        
        if self.status != IN_PROGRESS:
            raise ValueError(f"Cannot start discussion when status is {self.status}")
        
        discussion = PanelDiscussion(
            round_number=round_number,
            started_at=datetime.utcnow(),
            completed_at=None
        )
        self.discussions.append(discussion)
        self._update_timestamp()
        
        self._add_event("discussion_started", {
            "round_number": round_number
        })
        
        return discussion
    
    def add_message(
        self,
        round_number: int,
        agent_id: str,
        agent_name: str,
        content: str,
        message_type: str = "response"
    ) -> None:
        """Add message to discussion round"""
        self._validate_tenant_context()
        
        # Find discussion round
        discussion = next(
            (d for d in self.discussions if d.round_number == round_number),
            None
        )
        if not discussion:
            raise ValueError(f"Discussion round {round_number} not found")
        
        message = PanelMessage(
            agent_id=agent_id,
            agent_name=agent_name,
            content=content,
            timestamp=datetime.utcnow(),
            round_number=round_number,
            message_type=message_type
        )
        discussion.add_message(message)
        self._update_timestamp()
        
        self._add_event("message_added", {
            "round_number": round_number,
            "agent_id": agent_id,
            "message_type": message_type
        })
    
    def complete_discussion_round(self, round_number: int) -> None:
        """Complete a discussion round"""
        self._validate_tenant_context()
        
        discussion = next(
            (d for d in self.discussions if d.round_number == round_number),
            None
        )
        if not discussion:
            raise ValueError(f"Discussion round {round_number} not found")
        
        discussion.complete()
        self._update_timestamp()
        
        self._add_event("discussion_completed", {
            "round_number": round_number,
            "message_count": len(discussion.messages)
        })
    
    def update_consensus(self, consensus: ConsensusResult) -> None:
        """Update panel consensus result"""
        self._validate_tenant_context()
        
        self.consensus = consensus
        self._update_timestamp()
        
        self._add_event("consensus_updated", {
            "level": consensus.level,
            "method": consensus.method,
            "has_dissent": consensus.has_dissent
        })
        
        logger.info(
            f"Consensus updated",
            extra={
                "tenant_id": str(self.tenant_id),
                "panel_id": str(self.panel_id),
                "consensus_level": consensus.level,
                "method": consensus.method
            }
        )
    
    def complete(self, recommendation: str) -> None:
        """Complete panel with final recommendation"""
        self._validate_tenant_context()
        
        if not self.consensus:
            raise ValueError("Cannot complete panel without consensus")
        
        self.final_recommendation = recommendation
        self.status = COMPLETED
        self.completed_at = datetime.utcnow()
        self._update_timestamp()
        
        self._add_event("panel_completed", {
            "consensus_level": self.consensus.level,
            "rounds_completed": len(self.discussions),
            "total_messages": sum(len(d.messages) for d in self.discussions)
        })
        
        logger.info(
            f"Panel completed",
            extra={
                "tenant_id": str(self.tenant_id),
                "panel_id": str(self.panel_id),
                "consensus_level": self.consensus.level if self.consensus else 0,
                "duration_seconds": (
                    self.completed_at - self.created_at
                ).total_seconds()
            }
        )
    
    def fail(self, reason: str) -> None:
        """Mark panel as failed"""
        self._validate_tenant_context()
        
        self.status = FAILED
        self.configuration['failure_reason'] = reason
        self.completed_at = datetime.utcnow()
        self._update_timestamp()
        
        self._add_event("panel_failed", {
            "reason": reason
        })
        
        logger.error(
            f"Panel failed",
            extra={
                "tenant_id": str(self.tenant_id),
                "panel_id": str(self.panel_id),
                "reason": reason
            }
        )
    
    def change_status(self, new_status: PanelStatus) -> None:
        """Change panel status with validation"""
        self._validate_tenant_context()
        
        if not self.status.can_transition_to(new_status):
            raise ValueError(
                f"Invalid status transition: {self.status} -> {new_status}"
            )
        
        old_status = self.status
        self.status = new_status
        self._update_timestamp()
        
        self._add_event("status_changed", {
            "old_status": str(old_status),
            "new_status": str(new_status)
        })
    
    # === Helper Methods ===
    
    def _update_timestamp(self):
        """Update last modified timestamp"""
        self.updated_at = datetime.utcnow()
    
    def _add_event(self, event_type: str, data: Dict[str, Any]):
        """Add domain event"""
        event = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "panel_id": str(self.panel_id),
            "tenant_id": str(self.tenant_id),
            "data": data
        }
        self._domain_events.append(event)
    
    def get_events(self) -> List[Dict[str, Any]]:
        """Get all domain events"""
        return self._domain_events.copy()
    
    def clear_events(self):
        """Clear domain events (after publishing)"""
        self._domain_events.clear()
    
    # === Query Methods ===
    
    @property
    def total_messages(self) -> int:
        """Total messages across all discussions"""
        return sum(len(d.messages) for d in self.discussions)
    
    @property
    def duration_seconds(self) -> Optional[float]:
        """Panel duration in seconds"""
        if not self.completed_at:
            return None
        return (self.completed_at - self.created_at).total_seconds()
    
    @property
    def is_complete(self) -> bool:
        """Check if panel is complete"""
        return self.status == COMPLETED
    
    @property
    def has_consensus(self) -> bool:
        """Check if consensus exists"""
        return self.consensus is not None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "panel_id": str(self.panel_id),
            "tenant_id": str(self.tenant_id),
            "query": self.query,
            "panel_type": str(self.panel_type),
            "status": str(self.status),
            "members": [
                {
                    "agent_id": m.agent_id,
                    "agent_name": m.agent_name,
                    "agent_role": m.agent_role,
                    "added_at": m.added_at.isoformat()
                }
                for m in self.members
            ],
            "discussions": [
                {
                    "round_number": d.round_number,
                    "started_at": d.started_at.isoformat(),
                    "completed_at": d.completed_at.isoformat() if d.completed_at else None,
                    "messages": [
                        {
                            "agent_id": msg.agent_id,
                            "agent_name": msg.agent_name,
                            "content": msg.content,
                            "timestamp": msg.timestamp.isoformat(),
                            "message_type": msg.message_type
                        }
                        for msg in d.messages
                    ]
                }
                for d in self.discussions
            ],
            "consensus": self.consensus.to_dict() if self.consensus else None,
            "final_recommendation": self.final_recommendation,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "configuration": self.configuration,
            "total_messages": self.total_messages,
            "duration_seconds": self.duration_seconds
        }
```

CODE REQUIREMENTS:
1. Follow Domain-Driven Design patterns
2. Immutable value objects (frozen dataclasses)
3. Rich domain behavior in aggregate root
4. Tenant context validation in all operations
5. Domain events for state changes
6. Business rule enforcement
7. Comprehensive validation
8. Detailed logging with tenant context

TESTING:
Create tests/domain/test_panel.py with:
- Value object creation and validation
- Status transitions
- Member addition
- Discussion rounds
- Consensus updates
- Domain events
- Tenant context validation

VALIDATION:
```python
# Test panel creation
from domain.models.panel import Panel
from domain.models.panel_id import PanelId
from domain.models.panel_type import STRUCTURED
from vital_shared_kernel.multi_tenant import TenantId, TenantContext

tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
TenantContext.set(tenant_id)

panel = Panel(
    panel_id=PanelId.generate(),
    tenant_id=tenant_id,
    query="How should we approach FDA 510(k) submission?",
    panel_type=STRUCTURED
)

panel.add_member("fda_expert", "Dr. FDA Expert", "Regulatory Strategy")
print(f"✅ Panel created: {panel.panel_id}")
print(f"✅ Members: {len(panel.members)}")
```

Implement complete domain model with all value objects and aggregate root.
```

---

## PROMPT 3.2: Panel Strategy Interface

**Copy this entire section to Cursor AI:**

```
TASK: Create abstract panel strategy interface and base implementation

CONTEXT:
Need polymorphic strategy pattern for 6 panel types. Each strategy defines:
- Expert selection logic
- Discussion flow pattern
- Consensus building approach
- LangGraph workflow structure

REQUIREMENTS:
- Abstract base class (ABC) for all strategies
- Template method pattern for common flow
- Strategy-specific implementations
- Tenant context in all operations
- Metrics and logging

LOCATION: services/ask-panel-service/src/domain/

CREATE FILE: strategies/base_strategy.py

```python
"""Base Panel Strategy - Abstract interface for all panel types"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import logging

from vital_shared_kernel.multi_tenant import TenantContext

from ..models.panel import Panel
from ..models.panel_type import PanelType

logger = logging.getLogger(__name__)


class BasePanelStrategy(ABC):
    """
    Abstract base class for all panel orchestration strategies.
    
    Implements Template Method pattern for common panel flow:
    1. Initialize panel
    2. Select experts
    3. Execute discussion(s)
    4. Build consensus
    5. Generate recommendation
    6. Finalize panel
    
    Subclasses override strategy-specific methods.
    """
    
    def __init__(self, name: str, panel_type: PanelType):
        self.name = name
        self.panel_type = panel_type
        logger.info(f"Strategy initialized: {name}")
    
    # === Template Method ===
    
    async def execute(self, panel: Panel) -> Panel:
        """
        Template method - orchestrates full panel execution.
        
        This is the main entry point. Subclasses typically don't override this.
        """
        tenant_id = TenantContext.get()
        
        logger.info(
            f"Executing {self.name} strategy",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "panel_type": str(self.panel_type)
            }
        )
        
        try:
            # 1. Initialize
            panel = await self.initialize_panel(panel)
            
            # 2. Select experts (if not already selected)
            if len(panel.members) == 0:
                await self.select_experts(panel)
            
            # 3. Execute strategy-specific discussion flow
            panel = await self.execute_discussion(panel)
            
            # 4. Build consensus
            await self.build_consensus(panel)
            
            # 5. Generate final recommendation
            recommendation = await self.generate_recommendation(panel)
            panel.complete(recommendation)
            
            # 6. Finalize
            panel = await self.finalize_panel(panel)
            
            await self.log_strategy_metrics(panel)
            
            return panel
            
        except Exception as e:
            logger.error(
                f"Strategy execution failed: {str(e)}",
                extra={
                    "tenant_id": str(tenant_id),
                    "panel_id": str(panel.panel_id),
                    "strategy": self.name
                },
                exc_info=True
            )
            panel.fail(str(e))
            raise
    
    # === Abstract Methods (Must be implemented by subclasses) ===
    
    @abstractmethod
    async def select_experts(self, panel: Panel) -> None:
        """
        Select appropriate experts for this panel type.
        
        Subclasses define:
        - Number of experts needed
        - Expert selection criteria
        - Role distribution
        """
        pass
    
    @abstractmethod
    async def execute_discussion(self, panel: Panel) -> Panel:
        """
        Execute the discussion flow specific to this panel type.
        
        Subclasses define:
        - Number of discussion rounds
        - Message exchange pattern
        - Expert interaction rules
        """
        pass
    
    @abstractmethod
    async def build_consensus(self, panel: Panel) -> None:
        """
        Build consensus using strategy-specific approach.
        
        Subclasses define:
        - Consensus algorithm
        - Weighting scheme
        - Dissent handling
        """
        pass
    
    # === Hook Methods (Can be overridden) ===
    
    async def initialize_panel(self, panel: Panel) -> Panel:
        """
        Initialize panel before execution.
        Common setup for all strategies.
        """
        tenant_id = TenantContext.get()
        
        from ..models.panel_status import PanelStatus
        panel.status = PanelStatus.IN_PROGRESS
        
        logger.info("Panel initialized", extra={
            "tenant_id": str(tenant_id),
            "panel_id": str(panel.panel_id),
            "strategy": self.name
        })
        
        return panel
    
    async def finalize_panel(self, panel: Panel) -> Panel:
        """
        Finalize panel after execution.
        Common cleanup for all strategies.
        """
        tenant_id = TenantContext.get()
        
        # Build final consensus if not done
        if not panel.consensus:
            from ..services.consensus_builder import ConsensusBuilder
            builder = ConsensusBuilder()
            
            all_responses = []
            for discussion in panel.discussions:
                all_responses.extend(discussion.messages)
            
            consensus = await builder.calculate_consensus(all_responses)
            panel.update_consensus(consensus)
        
        # Generate final recommendation
        if not panel.final_recommendation:
            from ..services.quantum_consensus import QuantumConsensus
            quantum = QuantumConsensus()
            
            all_responses = []
            for discussion in panel.discussions:
                all_responses.extend(discussion.messages)
            
            recommendation = await quantum.collapse_superposition(all_responses)
            panel.complete(recommendation)
        
        logger.info("Panel finalized", extra={
            "tenant_id": str(tenant_id),
            "panel_id": str(panel.panel_id),
            "consensus_level": panel.consensus.level if panel.consensus else 0,
            "rounds_completed": len(panel.discussions)
        })
        
        return panel
    
    async def generate_recommendation(self, panel: Panel) -> str:
        """
        Generate final recommendation from consensus.
        
        Default implementation - subclasses can override.
        """
        if not panel.consensus:
            raise ValueError("Cannot generate recommendation without consensus")
        
        return panel.consensus.recommendation
    
    async def log_strategy_metrics(self, panel: Panel) -> None:
        """Log metrics for this strategy execution"""
        tenant_id = TenantContext.get()
        
        logger.info("Strategy metrics", extra={
            "tenant_id": str(tenant_id),
            "panel_id": str(panel.panel_id),
            "strategy": self.name,
            "duration_seconds": (
                panel.completed_at - panel.created_at
            ).total_seconds() if panel.completed_at else 0,
            "rounds": len(panel.discussions),
            "experts": len(panel.members),
            "consensus": panel.consensus.level if panel.consensus else 0
        })
```

CODE REQUIREMENTS:
1. Use ABC for abstract base class
2. All methods include tenant context
3. Comprehensive logging with tenant_id
4. Validation before execution
5. Common initialization and finalization
6. Hook methods for extensibility
7. Error handling and metrics

VALIDATION:
Cannot test directly (abstract class). Will test with concrete implementations in next prompt.

Implement base strategy interface with template method pattern.
```

---

## PROMPT 3.3: Concrete Panel Strategies (Structured & Open)

**Copy this entire section to Cursor AI:**

```
TASK: Implement Structured and Open panel strategies

CONTEXT:
Building first 2 concrete strategy implementations:
- Structured: Sequential moderated discussion for regulatory strategy
- Open: Parallel collaborative exploration for brainstorming

REQUIREMENTS:
Each strategy implements:
- Expert selection logic
- Discussion flow pattern
- Consensus building
- LangGraph integration hooks

LOCATION: services/ask-panel-service/src/domain/strategies/

CREATE FILES:

1. structured_strategy.py

```python
"""Structured Panel Strategy - Sequential moderated discussion"""

from typing import List, Dict, Any
import logging

from vital_shared_kernel.multi_tenant import TenantContext

from .base_strategy import BasePanelStrategy
from ..models.panel import Panel
from ..models.panel_type import STRUCTURED

logger = logging.getLogger(__name__)


class StructuredPanelStrategy(BasePanelStrategy):
    """
    Structured panel strategy for regulatory and compliance decisions.
    
    Flow:
    1. Moderator introduces topic
    2. Each expert speaks sequentially
    3. Round-robin discussion for 2-3 rounds
    4. Consensus building with dissent capture
    5. Final recommendation
    
    Use cases:
    - FDA submissions
    - Regulatory strategy
    - Compliance reviews
    - Clinical trial design
    """
    
    def __init__(self):
        super().__init__("Structured Panel", STRUCTURED)
        self.rounds = 3
        self.speaking_order = "sequential"
    
    async def select_experts(self, panel: Panel) -> None:
        """
        Select 3-5 experts with complementary roles.
        
        Required roles:
        - Domain expert (e.g., FDA expert)
        - Clinical expert
        - Regulatory strategist
        - Optional: Market access, reimbursement
        """
        tenant_id = TenantContext.get()
        
        # Get recommended expert count
        min_experts, max_experts = self.panel_type.recommended_experts
        target_experts = 4  # Sweet spot for structured panels
        
        logger.info(
            f"Selecting experts for structured panel",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "target_experts": target_experts
            }
        )
        
        # In production, this would call AgentRegistry
        # For now, add placeholder logic
        
        # Example expert roles for structured panel
        expert_roles = [
            ("fda_expert", "Dr. FDA Regulatory Expert", "Regulatory Strategy"),
            ("clinical_expert", "Dr. Clinical Expert", "Clinical Evidence"),
            ("strategist", "Strategic Advisor", "Market Access"),
            ("reimbursement", "Reimbursement Expert", "Payer Strategy")
        ]
        
        for agent_id, agent_name, role in expert_roles[:target_experts]:
            panel.add_member(agent_id, agent_name, role)
        
        logger.info(
            f"Experts selected",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "expert_count": len(panel.members)
            }
        )
    
    async def execute_discussion(self, panel: Panel) -> Panel:
        """
        Execute structured discussion with sequential speaking.
        
        Pattern:
        - Round 1: Initial responses (each expert speaks once)
        - Round 2: Reactions and elaborations
        - Round 3: Convergence and final positions
        """
        tenant_id = TenantContext.get()
        
        from ..models.panel_status import IN_PROGRESS
        panel.change_status(IN_PROGRESS)
        
        for round_num in range(1, self.rounds + 1):
            logger.info(
                f"Starting discussion round {round_num}",
                extra={
                    "tenant_id": str(tenant_id),
                    "panel_id": str(panel.panel_id),
                    "round": round_num
                }
            )
            
            discussion = panel.start_discussion_round(round_num)
            
            # Each expert speaks in order
            for member in panel.members:
                # In production, this would call LLM via LangGraph
                # For now, create placeholder message
                
                content = self._generate_expert_response(
                    panel=panel,
                    expert=member,
                    round_num=round_num
                )
                
                panel.add_message(
                    round_number=round_num,
                    agent_id=member.agent_id,
                    agent_name=member.agent_name,
                    content=content,
                    message_type="response"
                )
            
            panel.complete_discussion_round(round_num)
            
            logger.info(
                f"Discussion round {round_num} complete",
                extra={
                    "tenant_id": str(tenant_id),
                    "panel_id": str(panel.panel_id),
                    "messages": len(discussion.messages)
                }
            )
        
        return panel
    
    def _generate_expert_response(
        self,
        panel: Panel,
        expert: Any,
        round_num: int
    ) -> str:
        """
        Generate expert response for this round.
        
        In production, this calls LangGraph workflow.
        """
        # Placeholder - real implementation uses LLM
        round_context = {
            1: "initial perspective",
            2: "reaction to other experts",
            3: "final position and recommendation"
        }
        
        return (
            f"[{expert.agent_role}] - Round {round_num} "
            f"({round_context.get(round_num, 'response')}): "
            f"Expert analysis regarding: {panel.query[:100]}..."
        )
    
    async def build_consensus(self, panel: Panel) -> None:
        """
        Build consensus from structured discussion.
        
        Method:
        1. Analyze convergence across rounds
        2. Identify agreement points
        3. Document dissenting opinions
        4. Calculate consensus score
        """
        tenant_id = TenantContext.get()
        
        logger.info(
            "Building consensus",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "total_messages": panel.total_messages
            }
        )
        
        # Get all messages
        all_messages = []
        for discussion in panel.discussions:
            all_messages.extend(discussion.messages)
        
        # In production, call consensus service
        from ..services.consensus_builder import ConsensusBuilder
        builder = ConsensusBuilder()
        
        consensus_result = await builder.calculate_consensus(
            messages=all_messages,
            method="standard"
        )
        
        panel.update_consensus(consensus_result)
        
        logger.info(
            "Consensus built",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "consensus_level": consensus_result.level,
                "has_dissent": consensus_result.has_dissent
            }
        )
```

2. open_strategy.py

```python
"""Open Panel Strategy - Parallel collaborative exploration"""

from typing import List, Dict, Any
import logging
import asyncio

from vital_shared_kernel.multi_tenant import TenantContext

from .base_strategy import BasePanelStrategy
from ..models.panel import Panel
from ..models.panel_type import OPEN

logger = logging.getLogger(__name__)


class OpenPanelStrategy(BasePanelStrategy):
    """
    Open panel strategy for brainstorming and innovation.
    
    Flow:
    1. All experts receive query simultaneously
    2. Parallel response generation (no speaking order)
    3. Cross-pollination round (experts respond to each other)
    4. Synthesis of diverse perspectives
    5. Multiple recommendations (not forced consensus)
    
    Use cases:
    - Innovation ideation
    - Strategic planning
    - Technology evaluation
    - Market opportunity assessment
    """
    
    def __init__(self):
        super().__init__("Open Panel", OPEN)
        self.rounds = 2  # Fewer rounds, more parallel
        self.speaking_order = "parallel"
    
    async def select_experts(self, panel: Panel) -> None:
        """
        Select 5-8 experts with diverse perspectives.
        
        Diversity dimensions:
        - Different domains (clinical, technical, market)
        - Different experience levels
        - Different organizational perspectives
        """
        tenant_id = TenantContext.get()
        
        # Get recommended expert count
        min_experts, max_experts = self.panel_type.recommended_experts
        target_experts = 6  # More experts for diverse views
        
        logger.info(
            f"Selecting experts for open panel",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "target_experts": target_experts
            }
        )
        
        # Diverse expert roles for open panel
        expert_roles = [
            ("innovation_expert", "Innovation Strategist", "Innovation"),
            ("technical_expert", "Technical Architect", "Technology"),
            ("market_expert", "Market Analyst", "Market Dynamics"),
            ("clinical_expert", "Clinical Expert", "Clinical Practice"),
            ("startup_expert", "Startup Advisor", "Commercialization"),
            ("investor", "Healthcare Investor", "Investment Strategy")
        ]
        
        for agent_id, agent_name, role in expert_roles[:target_experts]:
            panel.add_member(agent_id, agent_name, role)
        
        logger.info(
            f"Diverse experts selected",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "expert_count": len(panel.members)
            }
        )
    
    async def execute_discussion(self, panel: Panel) -> Panel:
        """
        Execute open discussion with parallel contributions.
        
        Pattern:
        - Round 1: Initial perspectives (all experts simultaneously)
        - Round 2: Cross-pollination (experts react to others)
        """
        tenant_id = TenantContext.get()
        
        from ..models.panel_status import IN_PROGRESS
        panel.change_status(IN_PROGRESS)
        
        # Round 1: Parallel initial responses
        logger.info(
            "Starting parallel initial responses",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id)
            }
        )
        
        discussion_1 = panel.start_discussion_round(1)
        
        # Generate all responses in parallel
        tasks = [
            self._generate_expert_response_async(panel, member, 1)
            for member in panel.members
        ]
        responses = await asyncio.gather(*tasks)
        
        # Add all messages
        for member, content in zip(panel.members, responses):
            panel.add_message(
                round_number=1,
                agent_id=member.agent_id,
                agent_name=member.agent_name,
                content=content,
                message_type="initial_response"
            )
        
        panel.complete_discussion_round(1)
        
        # Round 2: Cross-pollination
        logger.info(
            "Starting cross-pollination round",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id)
            }
        )
        
        discussion_2 = panel.start_discussion_round(2)
        
        # Each expert reacts to others
        tasks = [
            self._generate_reaction_async(panel, member, 2)
            for member in panel.members
        ]
        reactions = await asyncio.gather(*tasks)
        
        for member, content in zip(panel.members, reactions):
            panel.add_message(
                round_number=2,
                agent_id=member.agent_id,
                agent_name=member.agent_name,
                content=content,
                message_type="reaction"
            )
        
        panel.complete_discussion_round(2)
        
        logger.info(
            "Open discussion complete",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "total_messages": panel.total_messages
            }
        )
        
        return panel
    
    async def _generate_expert_response_async(
        self,
        panel: Panel,
        expert: Any,
        round_num: int
    ) -> str:
        """Generate expert response asynchronously"""
        # In production, this calls LangGraph workflow
        # Simulate async work
        await asyncio.sleep(0.1)
        
        return (
            f"[{expert.agent_role}] - Initial perspective: "
            f"Analysis of {panel.query[:100]}..."
        )
    
    async def _generate_reaction_async(
        self,
        panel: Panel,
        expert: Any,
        round_num: int
    ) -> str:
        """Generate reaction to other experts asynchronously"""
        # In production, this analyzes other experts' responses
        await asyncio.sleep(0.1)
        
        return (
            f"[{expert.agent_role}] - Building on others' insights: "
            f"Cross-pollinated perspective..."
        )
    
    async def build_consensus(self, panel: Panel) -> None:
        """
        Build consensus from diverse perspectives.
        
        Method:
        1. Identify common themes
        2. Preserve diverse viewpoints
        3. Don't force agreement (embraces divergence)
        4. Multiple valid recommendations
        """
        tenant_id = TenantContext.get()
        
        logger.info(
            "Building consensus from diverse views",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id)
            }
        )
        
        # Get all messages
        all_messages = []
        for discussion in panel.discussions:
            all_messages.extend(discussion.messages)
        
        # Use consensus builder with "diversity" mode
        from ..services.consensus_builder import ConsensusBuilder
        builder = ConsensusBuilder()
        
        consensus_result = await builder.calculate_consensus(
            messages=all_messages,
            method="diversity_preserving"
        )
        
        panel.update_consensus(consensus_result)
        
        logger.info(
            "Diverse consensus built",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id),
                "consensus_level": consensus_result.level,
                "dimensions": len(consensus_result.dimensions)
            }
        )
    
    async def generate_recommendation(self, panel: Panel) -> str:
        """
        Generate recommendation that preserves diversity.
        
        For open panels, recommendation includes:
        - Core themes
        - Alternative approaches
        - Trade-offs
        """
        if not panel.consensus:
            raise ValueError("Cannot generate recommendation without consensus")
        
        # Build recommendation that preserves diverse perspectives
        recommendation = (
            f"Based on diverse expert perspectives:\n\n"
            f"{panel.consensus.recommendation}\n\n"
            f"Alternative Approaches:\n"
        )
        
        for i, opinion in enumerate(panel.consensus.dissenting_opinions, 1):
            recommendation += f"{i}. {opinion.agent_name}: {opinion.opinion}\n"
        
        return recommendation
```

CODE REQUIREMENTS:
1. Inherit from BasePanelStrategy
2. Implement all abstract methods
3. Strategy-specific flow logic
4. Tenant context throughout
5. Async/await patterns
6. Comprehensive logging
7. Error handling

TESTING:
Create tests/domain/strategies/test_strategies.py

VALIDATION:
```python
# Test structured strategy
from domain.strategies.structured_strategy import StructuredPanelStrategy
from domain.models.panel import Panel, PanelId
from domain.models.panel_type import STRUCTURED
from vital_shared_kernel.multi_tenant import TenantId, TenantContext

tenant_id = TenantId.from_string("11111111-1111-1111-1111-111111111111")
TenantContext.set(tenant_id)

panel = Panel(
    panel_id=PanelId.generate(),
    tenant_id=tenant_id,
    query="FDA 510(k) strategy?",
    panel_type=STRUCTURED
)

strategy = StructuredPanelStrategy()
panel = await strategy.execute(panel)

print(f"✅ Structured panel complete")
print(f"   Rounds: {len(panel.discussions)}")
print(f"   Messages: {panel.total_messages}")
print(f"   Consensus: {panel.consensus.level if panel.consensus else 0}")
```

Implement Structured and Open panel strategies with full execution logic.
```

---

Due to length constraints, I'll create the remaining prompts (3.4-3.6, Phase 4, 5, 6) in separate files. Let me continue:

<function_calls>
<invoke name="bash_tool">
<parameter name="command">wc -l /mnt/user-data/outputs/PHASE_3_DOMAIN_PANEL_ORCHESTRATION.md