"""
VITAL Path - Domain Layer

Pure business logic with no external dependencies.
This layer contains the core concepts and rules of the VITAL platform.

Structure:
- entities/: Domain entities (Agent, Workflow, Conversation, etc.)
- value_objects/: Immutable value objects (TokenUsage, TenantId, etc.)
- events/: Domain events (BudgetExceeded, WorkflowCompleted, etc.)
- services/: Domain services (BudgetService, AgentSelector, etc.)
- exceptions: Domain-specific exceptions
"""

from .exceptions import (
    DomainException,
    TenantContextRequiredException,
    UnauthorizedAccessException,
    BudgetExceededException,
    BudgetWarningException,
    WorkflowNotFoundException,
    WorkflowValidationException,
    WorkflowExecutionException,
    AgentNotFoundException,
    AgentConfigurationException,
    InvalidModeException,
    ModeExecutionException,
    DocumentNotFoundException,
    EmbeddingException,
    RetrievalException,
    LLMException,
    LLMRateLimitException,
    LLMContextLengthException,
    LLMTimeoutException,
    JobNotFoundException,
    JobAlreadyCompleteException,
    JobCancelledException,
)

__all__ = [
    # Exceptions
    "DomainException",
    "TenantContextRequiredException",
    "UnauthorizedAccessException",
    "BudgetExceededException",
    "BudgetWarningException",
    "WorkflowNotFoundException",
    "WorkflowValidationException",
    "WorkflowExecutionException",
    "AgentNotFoundException",
    "AgentConfigurationException",
    "InvalidModeException",
    "ModeExecutionException",
    "DocumentNotFoundException",
    "EmbeddingException",
    "RetrievalException",
    "LLMException",
    "LLMRateLimitException",
    "LLMContextLengthException",
    "LLMTimeoutException",
    "JobNotFoundException",
    "JobAlreadyCompleteException",
    "JobCancelledException",
]






