"""
ENGAGE Task Runners - Stakeholder Engagement.

This module provides task runners for stakeholder engagement:
- ProfileRunner: Profile stakeholder using attribute extraction
- InterestRunner: Map interests using interest analysis
- TouchpointRunner: Design engagement using journey mapping
- MessageRunner: Craft message using audience adaptation

Core Logic: Relationship Orchestration / Stakeholder Mapping

Engagement Pipeline:
    Profile → Interest → Touchpoint → Message

Example:
    >>> from langgraph_workflows.task_runners.engage import (
    ...     ProfileRunner, InterestRunner, TouchpointRunner, MessageRunner,
    ...     ProfileInput, InterestInput, TouchpointInput, MessageInput,
    ... )
    >>> runner = ProfileRunner()
    >>> result = await runner.execute(ProfileInput(
    ...     stakeholder_info={"name": "John", "role": "VP Sales"},
    ...     profile_depth="standard"
    ... ))
"""

# ProfileRunner - Attribute extraction stakeholder profiling
from .profile_runner import (
    ProfileRunner,
    ProfileInput,
    ProfileOutput,
    StakeholderProfile,
)

# InterestRunner - Interest analysis motivation mapping
from .interest_runner import (
    InterestRunner,
    InterestInput,
    InterestOutput,
    Interest,
)

# TouchpointRunner - Journey mapping engagement design
from .touchpoint_runner import (
    TouchpointRunner,
    TouchpointInput,
    TouchpointOutput,
    Touchpoint,
)

# MessageRunner - Audience adaptation message crafting
from .message_runner import (
    MessageRunner,
    MessageInput,
    MessageOutput,
    TailoredMessage,
)

__all__ = [
    # ProfileRunner
    "ProfileRunner",
    "ProfileInput",
    "ProfileOutput",
    "StakeholderProfile",
    # InterestRunner
    "InterestRunner",
    "InterestInput",
    "InterestOutput",
    "Interest",
    # TouchpointRunner
    "TouchpointRunner",
    "TouchpointInput",
    "TouchpointOutput",
    "Touchpoint",
    # MessageRunner
    "MessageRunner",
    "MessageInput",
    "MessageOutput",
    "TailoredMessage",
]
