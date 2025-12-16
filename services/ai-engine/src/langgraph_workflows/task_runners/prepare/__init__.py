"""
PREPARE Category - Readiness Runners

This category contains atomic cognitive operations for gathering context,
anticipating Q&A, generating briefs, and extracting talking points.

Runners:
    - ContextRunner: Gather context (information aggregation)
    - AnticipateRunner: Predict Q&A (Theory of Mind)
    - BriefRunner: Generate brief (narrative construction)
    - TalkingPointRunner: Extract key messages (salience extraction)

Core Logic: Contextualization / Anticipatory Planning

Each runner is designed for:
    - 60-120 second execution time
    - Single preparation operation
    - Stateless operation (no memory between invocations)
    - Composable: Context → Anticipate → Brief → TalkingPoints
"""

from .context_runner import (
    ContextRunner,
    ContextInput,
    ContextOutput,
    ContextFact,
    Stakeholder,
)
from .anticipate_runner import (
    AnticipateRunner,
    AnticipateInput,
    AnticipateOutput,
    AnticipatedQuestion,
)
from .brief_runner import (
    BriefRunner,
    BriefInput,
    BriefOutput,
    BriefSection,
)
from .talking_point_runner import (
    TalkingPointRunner,
    TalkingPointInput,
    TalkingPointOutput,
    TalkingPoint,
)

__all__ = [
    # Runners
    "ContextRunner",
    "AnticipateRunner",
    "BriefRunner",
    "TalkingPointRunner",
    # Context schemas
    "ContextInput",
    "ContextOutput",
    "ContextFact",
    "Stakeholder",
    # Anticipate schemas
    "AnticipateInput",
    "AnticipateOutput",
    "AnticipatedQuestion",
    # Brief schemas
    "BriefInput",
    "BriefOutput",
    "BriefSection",
    # Talking Point schemas
    "TalkingPointInput",
    "TalkingPointOutput",
    "TalkingPoint",
]
