"""
Knowledge Library - Domain Knowledge Assets

Static knowledge assets and domain-specific data.

Categories:
- Medical terminology (ICD-10, CPT, LOINC, SNOMED)
- Regulatory frameworks (FDA, EMA, ICH)
- Industry standards
- Reference data

Usage:
    from libraries.knowledge import load_medical_codes, load_regulatory_guidance
"""

from typing import Dict, Any, List

# Knowledge registries (populated at runtime)
MEDICAL_CODES: Dict[str, Dict[str, Any]] = {}
REGULATORY_GUIDANCE: Dict[str, Dict[str, Any]] = {}


def load_medical_codes(code_system: str) -> Dict[str, Any]:
    """Load medical codes for a given system (ICD-10, CPT, etc.)."""
    return MEDICAL_CODES.get(code_system, {})


def load_regulatory_guidance(agency: str) -> Dict[str, Any]:
    """Load regulatory guidance for a given agency (FDA, EMA, etc.)."""
    return REGULATORY_GUIDANCE.get(agency, {})


__all__ = [
    "MEDICAL_CODES",
    "REGULATORY_GUIDANCE",
    "load_medical_codes",
    "load_regulatory_guidance",
]
