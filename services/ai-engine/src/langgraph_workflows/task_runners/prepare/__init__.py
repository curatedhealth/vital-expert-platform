"""
PREPARE Category - Readiness Runners

This category contains atomic cognitive operations for gathering context,
anticipating Q&A, generating briefs, extracting talking points, and
setting up monitoring infrastructure.

Runners (5 total):
    - ContextRunner: Gather context (information aggregation)
    - AnticipateRunner: Predict Q&A (Theory of Mind)
    - BriefRunner: Generate brief (narrative construction)
    - TalkingPointRunner: Extract key messages (salience extraction)
    - MonitoringSetupRunner: Set up monitoring infrastructure (monitoring architecture)

Core Logic: Contextualization / Anticipatory Planning / Infrastructure Setup

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
from .monitoring_setup_runner import (
    MonitoringSetupRunner,
    MonitoringSetupInput,
    MonitoringSetupOutput,
    MonitoringMetric,
    MonitoringDashboard,
    AlertConfiguration,
)

__all__ = [
    # Runners
    "ContextRunner",
    "AnticipateRunner",
    "BriefRunner",
    "TalkingPointRunner",
    "MonitoringSetupRunner",
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
    # Monitoring Setup schemas
    "MonitoringSetupInput",
    "MonitoringSetupOutput",
    "MonitoringMetric",
    "MonitoringDashboard",
    "AlertConfiguration",
]
