"""
Compatibility shim mapping legacy Mode 4 workflow imports to the unified
autonomous workflow implementation.
"""

class Mode4AutonomousManualWorkflow:
    """Legacy shim for Mode 4 autonomous workflow (auto agent selection)."""

    def __init__(self, *args, **kwargs):
        super().__init__()
