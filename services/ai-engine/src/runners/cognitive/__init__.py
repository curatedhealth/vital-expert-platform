"""
Cognitive Task Runners - Atomic Mental Operations

88+ task runners organized into 22 cognitive categories:

Knowledge Acquisition:
- understand/: scan, explore, gap_detect, extract

Quality Assessment:
- evaluate/: critique, compare, score, benchmark

Strategic Choice:
- decide/: frame, option_gen, tradeoff, recommend

Content Generation:
- create/: draft, expand, format, citation

Integration:
- synthesize/: collect, theme, resolve, narrate

Verification:
- validate/: compliance_check, fact_check, citation_check, consistency_check

... and 16 more categories
"""

from .base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)

__all__ = [
    "TaskRunner",
    "TaskRunnerCategory",
    "TaskRunnerInput",
    "TaskRunnerOutput",
]
