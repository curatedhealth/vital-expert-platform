"""
Compatibility shim for legacy imports of tool_chain_executor.
"""


class ToolStep:
    """Placeholder ToolStep for backwards compatibility."""

    def __init__(self, name: str = "", input_data=None):
        self.name = name
        self.input_data = input_data


class ToolChainPlan:
    """Placeholder plan container."""

    def __init__(self, steps=None):
        self.steps = steps or []


class StepResult:
    """Placeholder step result for compatibility."""

    def __init__(self, name: str = "", output=None):
        self.name = name
        self.output = output


class ToolChainResult:
    """Placeholder tool chain result."""

    def __init__(self, steps=None):
        self.steps = steps or []


class ToolChainExecutor:
    """Placeholder executor for backwards compatibility in tests."""

    def __init__(self, *args, **kwargs):
        self.steps = []

    def add_step(self, step: ToolStep):
        self.steps.append(step)

    def run(self):
        return {"steps_executed": len(self.steps)}
