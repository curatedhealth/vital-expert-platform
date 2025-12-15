"""
Compatibility shim for legacy imports of EnrichmentNodes.
"""


class EnrichmentNodes:
    """Placeholder class for backwards compatibility."""

    def __init__(self, *args, **kwargs):
        self.nodes = []

    def add(self, node):
        self.nodes.append(node)
