"""
INFLUENCE Task Runners - Persuasion & Communication.

This module provides task runners for influence and persuasion:
- ArgumentRunner: Build argument using argumentation theory
- FramingRunner: Frame message using framing theory
- NegotiateRunner: Plan negotiation using BATNA analysis
- StoryRunner: Craft story using narrative structure

Core Logic: Persuasion Science / Communication Strategy

Influence Pipeline:
    Argument → Frame → Negotiate → Story

Example:
    >>> from langgraph_workflows.task_runners.influence import (
    ...     ArgumentRunner, FramingRunner, NegotiateRunner, StoryRunner,
    ...     ArgumentInput, FramingInput, NegotiateInput, StoryInput,
    ... )
    >>> runner = ArgumentRunner()
    >>> result = await runner.execute(ArgumentInput(
    ...     claim="We should invest in AI",
    ...     argument_style="balanced"
    ... ))
"""

# ArgumentRunner - Argumentation theory structured argument
from .argument_runner import (
    ArgumentRunner,
    ArgumentInput,
    ArgumentOutput,
    Premise,
    Counterargument,
)

# FramingRunner - Framing theory message framing
from .frame_runner import (
    FramingRunner,
    FramingInput,
    FramingOutput,
    FramedMessage,
)

# NegotiateRunner - BATNA analysis negotiation planning
from .negotiate_runner import (
    NegotiateRunner,
    NegotiateInput,
    NegotiateOutput,
    NegotiationIssue,
)

# StoryRunner - Narrative structure storytelling
from .story_runner import (
    StoryRunner,
    StoryInput,
    StoryOutput,
    StoryElement,
)

__all__ = [
    # ArgumentRunner
    "ArgumentRunner",
    "ArgumentInput",
    "ArgumentOutput",
    "Premise",
    "Counterargument",
    # FramingRunner
    "FramingRunner",
    "FramingInput",
    "FramingOutput",
    "FramedMessage",
    # NegotiateRunner
    "NegotiateRunner",
    "NegotiateInput",
    "NegotiateOutput",
    "NegotiationIssue",
    # StoryRunner
    "StoryRunner",
    "StoryInput",
    "StoryOutput",
    "StoryElement",
]
