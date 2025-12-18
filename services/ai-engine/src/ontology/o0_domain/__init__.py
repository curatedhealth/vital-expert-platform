"""
L0: Domain Knowledge Layer

Foundation layer containing RAG references, therapeutic areas, evidence types,
diseases, products, stakeholders, and regulatory jurisdictions.

This layer provides the semantic foundation for all AI operations, including:
- Therapeutic area classification
- Evidence type hierarchies
- RAG namespace mapping
- Regulatory jurisdiction context
"""

from .models import (
    TherapeuticArea,
    EvidenceType,
    Disease,
    Product,
    StakeholderType,
    Jurisdiction,
    DomainContext,
)
from .service import L0DomainService

__all__ = [
    "L0DomainService",
    "TherapeuticArea",
    "EvidenceType",
    "Disease",
    "Product",
    "StakeholderType",
    "Jurisdiction",
    "DomainContext",
]


# Migrated services (Phase 4)
# from .service import *  # TODO: Define specific exports
# from .unified_rag import *  # TODO: Define specific exports
# from .models import *  # TODO: Define specific exports
# from .rag_selector import *  # TODO: Define specific exports
# from .evidence_types import *  # TODO: Define specific exports
# from .rag_diagnostics import *  # TODO: Define specific exports
# from .medical_rag import *  # TODO: Define specific exports
