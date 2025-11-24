"""Deep Agent Patterns Package

Advanced agent patterns for sophisticated reasoning:
- Tree-of-Thoughts: Multi-path strategic planning
- ReAct: Reasoning + Acting with tool use
- Constitutional AI: Self-critique and safety alignment
"""

from .tree_of_thoughts import (
    TreeOfThoughtsAgent,
    ThoughtEvaluationMode,
    Thought,
    ThoughtPath
)
from .react_agent import (
    ReActAgent,
    ReActStepType,
    ReActStep,
    ReActTrace
)
from .constitutional_ai import (
    ConstitutionalAgent,
    ConstitutionalPrinciple,
    CritiqueSeverity,
    CritiqueResult,
    ConstitutionalReview
)

__all__ = [
    # Tree-of-Thoughts
    "TreeOfThoughtsAgent",
    "ThoughtEvaluationMode",
    "Thought",
    "ThoughtPath",
    
    # ReAct
    "ReActAgent",
    "ReActStepType",
    "ReActStep",
    "ReActTrace",
    
    # Constitutional AI
    "ConstitutionalAgent",
    "ConstitutionalPrinciple",
    "CritiqueSeverity",
    "CritiqueResult",
    "ConstitutionalReview"
]

