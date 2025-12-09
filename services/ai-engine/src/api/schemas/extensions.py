"""
VITAL Protocol - Pydantic Model Extensions

Add custom methods and behavior to generated models here.
Use inheritance to extend generated models without modifying them.

Example:
    from ._generated.workflow import Workflow as GeneratedWorkflow
    
    class Workflow(GeneratedWorkflow):
        def get_entry_node(self):
            return next(n for n in self.nodes if n.id == self.entry_node_id)
"""

# Add your model extensions here
