"""
Compatibility shim mapping legacy Mode 3 workflow imports to the unified
autonomous workflow implementation.
"""

class Mode3AutonomousAutoWorkflow:
    """Legacy shim for Mode 3 autonomous workflow (manual agent selection)."""

    def __init__(self, *args, **kwargs):
        # No-op initializer for compatibility
        super().__init__()
