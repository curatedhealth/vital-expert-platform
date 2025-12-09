"""
VITAL Path AI Services - L2 Domain Experts (Shared)

L2 Experts provide deep domain-specific reasoning and analysis.
They are coordinated by L1 Master Orchestrators.

Domains:
- Regulatory: FDA, EMA, PMDA, ICH guidelines
- Clinical: Trials, endpoints, biostatistics
- Safety: Pharmacovigilance, adverse events, DDIs
- Medical Affairs: MSL, KOL, publications
- Commercial: Market access, pricing, payers

Model: Claude Sonnet 4 (cost-effective domain reasoning)
"""

from .l2_base import L2DomainExpert
from .l2_regulatory import L2RegulatoryExpert
from .l2_clinical import L2ClinicalExpert
from .l2_safety import L2SafetyExpert
from .l2_domain_lead import L2DomainLead

__all__ = [
    # Base
    "L2DomainExpert",
    # Domain experts
    "L2RegulatoryExpert",
    "L2ClinicalExpert",
    "L2SafetyExpert",
    "L2DomainLead",
]
