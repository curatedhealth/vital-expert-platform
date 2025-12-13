# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [agents.l2_experts, agents.l3_specialists, agents.l4_workers]
"""
Lazy registries for L2/L3/L4 agents to avoid circular imports and enable
dynamic code-to-class mapping. Expand mappings as new agents are added.
"""

from __future__ import annotations

from importlib import import_module
from typing import Any, Callable, Dict, Optional, Type

L2_MAP: Dict[str, str] = {
    "regulatory": "agents.l2_experts.l2_regulatory_expert.L2RegulatoryExpert",
    "clinical": "agents.l2_experts.l2_clinical_expert.L2ClinicalExpert",
    "safety": "agents.l2_experts.l2_safety_expert.L2SafetyExpert",
    "domain_lead": "agents.l2_experts.l2_domain_lead.L2DomainLead",
}

L3_MAP: Dict[str, str] = {
    "context_specialist": "agents.l3_specialists.l3_context_specialist.L3ContextSpecialist",
    "task_specialist": "agents.l3_specialists.l3_task_specialist.L3TaskSpecialist",
}

L4_MAP: Dict[str, str] = {
    "evidence": "agents.l4_workers.l4_evidence.L4EvidenceSynthesizer",
}


def _resolve(path: str) -> Optional[Type[Any]]:
    try:
        module_path, class_name = path.rsplit(".", 1)
        module = import_module(module_path)
        return getattr(module, class_name)
    except Exception:
        return None


def get_l2_class(code: str) -> Optional[Type[Any]]:
    if code in L2_MAP:
        return _resolve(L2_MAP[code])
    return _resolve(L2_MAP.get("domain_lead", ""))


def get_l3_class(code: str) -> Optional[Type[Any]]:
    if code in L3_MAP:
        return _resolve(L3_MAP[code])
    return _resolve(L3_MAP.get("context_specialist", ""))


def get_l4_class(code: str) -> Optional[Type[Any]]:
    if code in L4_MAP:
        return _resolve(L4_MAP[code])
    return _resolve(L4_MAP.get("evidence", ""))
