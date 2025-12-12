"""
VITAL Path AI Services - Ask Expert L2 Clinical Expert

L2 Domain Expert for clinical development.
(Re-export from regulatory file for proper module structure)

Naming Convention:
- Class: AskExpertL2ClinicalExpert
- Logs: ask_expert_l2_clinical_{action}
"""

from .ask_expert_l2_regulatory import AskExpertL2ClinicalExpert

__all__ = ["AskExpertL2ClinicalExpert"]
