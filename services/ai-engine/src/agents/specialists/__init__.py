"""
VITAL Path AI Services - L3 Task Specialists (Shared)

L3 Specialists are spawned by L2 Experts for specific sub-tasks.
They provide focused execution on well-defined tasks.

Task Types:
- analysis: Data analysis and interpretation
- literature_review: Source synthesis and summarization
- comparison: Alternative comparison and evaluation
- summarization: Content condensation

Model: Claude Sonnet 4 (efficient task execution)
"""

from .l3_base import L3TaskSpecialist
from .l3_context_specialist import L3ContextSpecialist
from .l3_domain_analyst import L3DomainAnalyst

__all__ = [
    "L3TaskSpecialist",
    "L3ContextSpecialist",
    "L3DomainAnalyst",
]
