"""
VITAL Path AI Services - VITAL L2 Clinical Expert

L2 Domain Expert for clinical development.
(Re-export from regulatory file for proper module structure)

Naming Convention:
- Class: L2ClinicalExpert
- Logs: l2_clinical_{action}
"""

from .l2_regulatory import L2ClinicalExpert

__all__ = ["L2ClinicalExpert"]
