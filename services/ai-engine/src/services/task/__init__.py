"""
Task Service - Mode 3 & 4 (Autonomous Research)

Deep research, evidence detection, and multi-domain search for autonomous workflows.

Mode 3: Supervised autonomous research with human checkpoints
Mode 4: Background autonomous execution without supervision

Components:
- Evidence-based agent selection (automatic expert routing)
- Evidence detection (find evidence in responses and documents)
- Multi-domain evidence detection (cross-domain search)
"""

from .evidence_based_selector import EvidenceBasedSelector
from .evidence_detector import EvidenceDetector
from .multi_domain_evidence_detector import MultiDomainEvidenceDetector

__all__ = [
    "EvidenceBasedSelector",
    "EvidenceDetector",
    "MultiDomainEvidenceDetector",
]
