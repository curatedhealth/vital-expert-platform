"""
Custom Exceptions for VITAL AI Services

TAG: SHARED_AI_EXCEPTIONS

Hierarchical exception system for clear error handling.

Exception Hierarchy:
    VitalAIError (base)
    ├── AgentSelectionError
    ├── RAGError
    ├──Tool ExecutionError
    ├── MemoryError
    └── ConfigurationError
"""


class VitalAIError(Exception):
    """
    Base exception for all VITAL AI services.
    
    All custom exceptions inherit from this for easy catching.
    """
    
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> dict:
        """Convert exception to dict for logging/API responses."""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "details": self.details,
        }


class AgentSelectionError(VitalAIError):
    """
    Raised when agent selection fails.
    
    Examples:
    - No agents available
    - Query analysis failed
    - Scoring error
    """
    pass


class RAGError(VitalAIError):
    """
    Raised when RAG operations fail.
    
    Examples:
    - Vector search failed
    - Embedding generation failed
    - No results found
    - Cache error
    """
    pass


class ToolExecutionError(VitalAIError):
    """
    Raised when tool execution fails.
    
    Examples:
    - Tool not found
    - Invalid input
    - External API error
    - Timeout
    """
    pass


class MemoryError(VitalAIError):
    """
    Raised when memory operations fail.
    
    Examples:
    - Session not found
    - Conversation retrieval failed
    - Summary generation failed
    """
    pass


class ConfigurationError(VitalAIError):
    """
    Raised when configuration is invalid.
    
    Examples:
    - Missing API keys
    - Invalid service URLs
    - Feature flag conflicts
    """
    pass


class TenantIsolationError(VitalAIError):
    """
    Raised when tenant isolation is violated.
    
    Critical security error.
    """
    pass

