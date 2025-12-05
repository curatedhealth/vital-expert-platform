"""
Multi-Domain Evidence Detection (Backward Compatibility Redirect)

DEPRECATED: This file is kept for backward compatibility only.
All functionality has been consolidated into evidence_detector.py.

Please update your imports to use:
    from services.evidence_detector import (
        EvidenceDetector,
        MultiDomainEvidenceDetector,
        EvidenceDomain,
        # ... other exports
    )

Created: 2025-10-25
Deprecated: 2025-12-02 - Consolidated into evidence_detector.py
"""

import warnings

# Issue deprecation warning
warnings.warn(
    "multi_domain_evidence_detector is deprecated. "
    "Import from evidence_detector instead.",
    DeprecationWarning,
    stacklevel=2
)

# Re-export everything from the consolidated module
from services.evidence_detector import (
    # Main classes
    EvidenceDetector,
    MultiDomainEvidenceDetector,

    # Singleton getters
    get_evidence_detector,
    get_multi_domain_detector,

    # Domain types
    EvidenceDomain,

    # Evidence types
    EvidenceType,
    MedicalEvidenceType,
    DigitalHealthEvidenceType,
    RegulatoryEvidenceType,
    ComplianceEvidenceType,

    # Entity types
    EntityType,
    MedicalEntityType,
    DigitalHealthEntityType,
    RegulatoryEntityType,

    # Quality
    EvidenceQuality,

    # Data structures
    MedicalEntity,
    Entity,
    Citation,
    Evidence,
)

__all__ = [
    "EvidenceDetector",
    "MultiDomainEvidenceDetector",
    "get_evidence_detector",
    "get_multi_domain_detector",
    "EvidenceDomain",
    "EvidenceType",
    "MedicalEvidenceType",
    "DigitalHealthEvidenceType",
    "RegulatoryEvidenceType",
    "ComplianceEvidenceType",
    "EntityType",
    "MedicalEntityType",
    "DigitalHealthEntityType",
    "RegulatoryEntityType",
    "EvidenceQuality",
    "MedicalEntity",
    "Entity",
    "Citation",
    "Evidence",
]
