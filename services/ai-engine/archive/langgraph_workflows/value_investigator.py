# PRODUCTION_TAG: DEPRECATED
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: []
# DEPENDENCIES: []
"""
Value Investigator stub for legacy compatibility.

DEPRECATED: This module provides stub implementations for backward compatibility.
The actual Value Investigator functionality is planned for the ontology-investigator module.
"""

import warnings
from typing import Any, Dict, Optional
from datetime import datetime

warnings.warn(
    "langgraph_workflows.value_investigator is deprecated and provides stub responses.",
    DeprecationWarning,
    stacklevel=2
)


async def investigate_value(
    query: str,
    tenant_id: Optional[str] = None,
    context_type: Optional[str] = None,
    context_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Investigate value framework data (stub implementation).

    Args:
        query: Natural language question about value
        tenant_id: Optional tenant context
        context_type: Context type (jtbd, role, function, category, driver)
        context_id: ID of the context entity

    Returns:
        Stub response indicating the feature is not yet implemented.
    """
    return {
        "success": False,
        "response": "Value Investigator is not yet implemented. This is a stub response.",
        "analysis_type": "stub",
        "recommendations": [],
        "citations": [],
        "confidence": 0.0,
        "model_used": "stub",
        "reasoning_steps": ["Feature pending implementation"],
        "timestamp": datetime.utcnow().isoformat(),
    }


def get_value_investigator() -> Optional[Any]:
    """
    Get the Value Investigator graph instance (stub).

    Returns:
        None - graph not available in stub mode.
    """
    return None


__all__ = ["investigate_value", "get_value_investigator"]
