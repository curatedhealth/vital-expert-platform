"""
VITAL Path - Translator Exceptions

Custom exceptions for the Translator module.
"""


class TranslatorError(Exception):
    """Base exception for translator errors."""
    pass


class ParseError(TranslatorError):
    """Error during workflow parsing."""
    
    def __init__(self, message: str, path: str = None):
        self.path = path
        full_message = f"{message}" + (f" at {path}" if path else "")
        super().__init__(full_message)


class ValidationError(TranslatorError):
    """Error during workflow validation."""
    
    def __init__(self, message: str, issues: list = None):
        self.issues = issues or []
        super().__init__(message)


class CompilationError(TranslatorError):
    """Error during workflow compilation."""
    
    def __init__(self, message: str, node_id: str = None):
        self.node_id = node_id
        full_message = f"{message}" + (f" (node: {node_id})" if node_id else "")
        super().__init__(full_message)


class NodeHandlerNotFoundError(TranslatorError):
    """Raised when no handler is registered for a node type."""
    
    def __init__(self, node_type: str):
        self.node_type = node_type
        super().__init__(f"No handler registered for node type: {node_type}")


class ConditionNotFoundError(TranslatorError):
    """Raised when no condition evaluator is registered."""
    
    def __init__(self, condition_id: str):
        self.condition_id = condition_id
        super().__init__(f"No condition evaluator registered: {condition_id}")


