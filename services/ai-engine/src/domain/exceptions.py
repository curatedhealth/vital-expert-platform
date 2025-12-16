"""
VITAL Path - Domain Exceptions

Custom exceptions for domain-level errors.
These exceptions represent business rule violations.
"""


class DomainException(Exception):
    """Base exception for all domain errors."""
    
    def __init__(self, message: str, code: str = None):
        self.code = code or self.__class__.__name__
        super().__init__(message)


# ============================================================================
# Organization & Auth Exceptions
# ============================================================================

class OrganizationContextRequiredException(DomainException):
    """Raised when an organization context is required but not provided."""
    
    def __init__(self, message: str = "Organization context is required"):
        super().__init__(message, code="ORGANIZATION_CONTEXT_REQUIRED")


# Legacy alias for backwards compatibility
TenantContextRequiredException = OrganizationContextRequiredException


class UnauthorizedAccessException(DomainException):
    """Raised when a user attempts to access a resource they don't own."""
    
    def __init__(self, resource_type: str, resource_id: str = None):
        message = f"Unauthorized access to {resource_type}"
        if resource_id:
            message += f" ({resource_id})"
        super().__init__(message, code="UNAUTHORIZED_ACCESS")


# ============================================================================
# Budget Exceptions
# ============================================================================

class BudgetExceededException(DomainException):
    """Raised when a tenant's token budget is exceeded."""
    
    def __init__(
        self,
        message: str = "Token budget exceeded",
        limit: int = None,
        used: int = None,
        requested: int = None,
    ):
        self.limit = limit
        self.used = used
        self.requested = requested
        super().__init__(message, code="BUDGET_EXCEEDED")


class BudgetWarningException(DomainException):
    """Raised when a tenant is approaching their budget limit."""
    
    def __init__(
        self,
        message: str = "Approaching token budget limit",
        percent_used: float = None,
    ):
        self.percent_used = percent_used
        super().__init__(message, code="BUDGET_WARNING")


# ============================================================================
# Workflow Exceptions
# ============================================================================

class WorkflowNotFoundException(DomainException):
    """Raised when a workflow is not found."""
    
    def __init__(self, workflow_id: str):
        super().__init__(
            f"Workflow not found: {workflow_id}",
            code="WORKFLOW_NOT_FOUND"
        )


class WorkflowValidationException(DomainException):
    """Raised when a workflow fails validation."""
    
    def __init__(self, message: str, errors: list = None):
        self.errors = errors or []
        super().__init__(message, code="WORKFLOW_VALIDATION_FAILED")


class WorkflowExecutionException(DomainException):
    """Raised when a workflow execution fails."""
    
    def __init__(self, message: str, node_id: str = None):
        self.node_id = node_id
        super().__init__(message, code="WORKFLOW_EXECUTION_FAILED")


# ============================================================================
# Agent Exceptions
# ============================================================================

class AgentNotFoundException(DomainException):
    """Raised when an agent is not found."""
    
    def __init__(self, agent_id: str):
        super().__init__(
            f"Agent not found: {agent_id}",
            code="AGENT_NOT_FOUND"
        )


class AgentConfigurationException(DomainException):
    """Raised when an agent is misconfigured."""
    
    def __init__(self, message: str, agent_id: str = None):
        self.agent_id = agent_id
        super().__init__(message, code="AGENT_CONFIGURATION_ERROR")


# ============================================================================
# Expert Mode Exceptions
# ============================================================================

class InvalidModeException(DomainException):
    """Raised when an invalid expert mode is specified."""
    
    def __init__(self, mode: str, valid_modes: list = None):
        valid = ", ".join(valid_modes) if valid_modes else "mode_1, mode_2, mode_3, mode_4"
        super().__init__(
            f"Invalid mode: {mode}. Valid modes are: {valid}",
            code="INVALID_MODE"
        )


class ModeExecutionException(DomainException):
    """Raised when an expert mode execution fails."""
    
    def __init__(self, message: str, mode: str = None):
        self.mode = mode
        super().__init__(message, code="MODE_EXECUTION_FAILED")


# ============================================================================
# Knowledge/RAG Exceptions
# ============================================================================

class DocumentNotFoundException(DomainException):
    """Raised when a document is not found."""
    
    def __init__(self, document_id: str):
        super().__init__(
            f"Document not found: {document_id}",
            code="DOCUMENT_NOT_FOUND"
        )


class EmbeddingException(DomainException):
    """Raised when embedding generation fails."""
    
    def __init__(self, message: str):
        super().__init__(message, code="EMBEDDING_FAILED")


class RetrievalException(DomainException):
    """Raised when knowledge retrieval fails."""
    
    def __init__(self, message: str):
        super().__init__(message, code="RETRIEVAL_FAILED")


# ============================================================================
# LLM Exceptions
# ============================================================================

class LLMException(DomainException):
    """Base exception for LLM-related errors."""
    pass


class LLMRateLimitException(LLMException):
    """Raised when LLM rate limit is hit."""
    
    def __init__(self, message: str = "LLM rate limit exceeded", retry_after: int = None):
        self.retry_after = retry_after
        super().__init__(message, code="LLM_RATE_LIMITED")


class LLMContextLengthException(LLMException):
    """Raised when context exceeds model's max length."""
    
    def __init__(self, message: str, max_tokens: int = None, actual_tokens: int = None):
        self.max_tokens = max_tokens
        self.actual_tokens = actual_tokens
        super().__init__(message, code="LLM_CONTEXT_TOO_LONG")


class LLMTimeoutException(LLMException):
    """Raised when LLM request times out."""
    
    def __init__(self, message: str = "LLM request timed out", timeout_seconds: int = None):
        self.timeout_seconds = timeout_seconds
        super().__init__(message, code="LLM_TIMEOUT")


# ============================================================================
# Job Exceptions
# ============================================================================

class JobNotFoundException(DomainException):
    """Raised when a job is not found."""
    
    def __init__(self, job_id: str):
        super().__init__(
            f"Job not found: {job_id}",
            code="JOB_NOT_FOUND"
        )


class JobAlreadyCompleteException(DomainException):
    """Raised when trying to modify a completed job."""
    
    def __init__(self, job_id: str, status: str):
        super().__init__(
            f"Job {job_id} is already {status}",
            code="JOB_ALREADY_COMPLETE"
        )


class JobCancelledException(DomainException):
    """Raised when a job is cancelled during execution."""
    
    def __init__(self, job_id: str, reason: str = None):
        message = f"Job {job_id} was cancelled"
        if reason:
            message += f": {reason}"
        super().__init__(message, code="JOB_CANCELLED")










