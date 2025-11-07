"""
VITAL AI Services - Shared AI Service Library

TAG: SHARED_AI_SERVICES_LIBRARY

A comprehensive Python package providing reusable AI services for the VITAL platform.

Modules:
- core: Shared models and exceptions
- agent: Agent selection services
- rag: RAG (Retrieval Augmented Generation) services
- tools: Tool registry and implementations
- prompt: Prompt management services

Usage:
    # Agent Selection
    from vital_ai_services.agent import AgentSelectorService
    
    # RAG
    from vital_ai_services.rag import UnifiedRAGService
    
    # Tools
    from vital_ai_services.tools import (
        ToolRegistry,
        WebSearchTool,
        RAGTool,
        CalculatorTool
    )
    
    # Prompts
    from vital_ai_services.prompt import PromptService
    
    # Models & Exceptions
    from vital_ai_services.core.models import (
        Source,
        Citation,
        RAGQuery,
        RAGResponse,
        ToolInput,
        ToolOutput
    )
    from vital_ai_services.core.exceptions import (
        VitalAIError,
        RAGError,
        ToolExecutionError
    )
"""

__version__ = "0.1.0"

# Core exports
from .core.models import (
    Source,
    Citation,
    AgentSelection,
    AgentScore,
    RAGQuery,
    RAGResponse,
    ToolInput,
    ToolOutput,
    ToolExecution,
    ReasoningStep,
    ConversationTurn,
    ConversationMemory,
    ServiceConfig,
)

from .core.exceptions import (
    VitalAIError,
    AgentSelectionError,
    RAGError,
    ToolExecutionError,
    MemoryError,
    ConfigurationError,
    TenantIsolationError,
)

# Service exports
from .agent.selector import AgentSelectorService
from .rag.service import UnifiedRAGService
from .tools import (
    BaseTool,
    ToolRegistry,
    WebSearchTool,
    RAGTool,
    CalculatorTool,
)
from .prompt import PromptService

__all__ = [
    # Version
    "__version__",
    
    # Core Models
    "Source",
    "Citation",
    "AgentSelection",
    "AgentScore",
    "RAGQuery",
    "RAGResponse",
    "ToolInput",
    "ToolOutput",
    "ToolExecution",
    "ReasoningStep",
    "ConversationTurn",
    "ConversationMemory",
    "ServiceConfig",
    
    # Core Exceptions
    "VitalAIError",
    "AgentSelectionError",
    "RAGError",
    "ToolExecutionError",
    "MemoryError",
    "ConfigurationError",
    "TenantIsolationError",
    
    # Services
    "AgentSelectorService",
    "UnifiedRAGService",
    "PromptService",
    
    # Tools
    "BaseTool",
    "ToolRegistry",
    "WebSearchTool",
    "RAGTool",
    "CalculatorTool",
]
