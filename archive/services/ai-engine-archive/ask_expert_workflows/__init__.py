# PRODUCTION_TAG: ARCHIVE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: []
# DEPENDENCIES: []
"""
VITAL Path - Archived Ask Expert Workflows

DEPRECATED: These workflows have been superseded by the unified architecture.

Migration Guide (December 12, 2025):
- ask_expert_mode3_workflow.py → unified_autonomous_workflow.py (use create_mode3_workflow())
- ask_expert_mode4_workflow.py → unified_autonomous_workflow.py (use create_mode4_workflow())

Why Unified:
- Mode 3 and Mode 4 are IDENTICAL except for agent selection method
- Mode 3: Manual agent selection (user selects)
- Mode 4: Automatic agent selection (Fusion Search)
- Both have FULL safety suite: check_budget, self_correct, circuit_breaker, hitl_plan_approval, hitl_step_review

These files are kept for reference only. DO NOT use in production.

For new implementations, use:
    from langgraph_workflows.ask_expert.unified_autonomous_workflow import (
        create_mode3_workflow,
        create_mode4_workflow,
    )
"""

# DEPRECATED - These imports are preserved for backward compatibility only
# They will be removed in a future version

import warnings

def _get_deprecated_workflow(name):
    """Helper to import deprecated workflows with warning."""
    warnings.warn(
        f"{name} is deprecated. Use unified_autonomous_workflow instead.",
        DeprecationWarning,
        stacklevel=3
    )

# If needed for backward compatibility, import from here with warning
__all__ = []
