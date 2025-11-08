"""
VITAL Shared Models

Pydantic models for data validation and serialization.
Used across all VITAL services for type-safe data handling.
"""

# Agent models
from vital_shared.models.agent import (
    AgentProfile,
    AgentCapability,
    AgentRole,
    AgentStatus,
    AgentContextWindow
)

# Citation models
from vital_shared.models.citation import (
    Citation,
    RAGResponse,
    RAGEmptyResponse,
    SourceType,
    RAGSearchFilters,
    RAGSearchContext
)

# Message models
from vital_shared.models.message import (
    Message,
    MessageRole,
    MessageStatus,
    ConversationTurn,
    ConversationSession
)

# Tool models
from vital_shared.models.tool import (
    ToolMetadata,
    ToolCategory,
    ToolCostTier,
    ToolExecutionSpeed,
    ToolParameter,
    ToolRegistry,
    get_tool_metadata,
    get_all_tools,
    get_tools_by_category,
    get_expensive_tools,
    search_tools,
    get_registry_stats,
    register_tool
)

# Artifact models
from vital_shared.models.artifact import (
    Artifact,
    ArtifactType,
    ArtifactFormat,
    ArtifactStatus,
    ArtifactVersion,
    Canvas
)

# Workflow state models
from vital_shared.models.workflow_state import (
    BaseWorkflowState,
    Mode1State,
    Mode2State,
    Mode3State,
    Mode4State,
    validate_base_state,
    initialize_base_state,
    initialize_mode1_state,
    initialize_mode2_state,
    initialize_mode3_state,
    initialize_mode4_state
)

__all__ = [
    # Agent
    "AgentProfile",
    "AgentCapability",
    "AgentRole",
    "AgentStatus",
    "AgentContextWindow",
    
    # Citation
    "Citation",
    "RAGResponse",
    "RAGEmptyResponse",
    "SourceType",
    "RAGSearchFilters",
    "RAGSearchContext",
    
    # Message
    "Message",
    "MessageRole",
    "MessageStatus",
    "ConversationTurn",
    "ConversationSession",
    
    # Tool
    "ToolMetadata",
    "ToolCategory",
    "ToolCostTier",
    "ToolExecutionSpeed",
    "ToolParameter",
    "ToolRegistry",
    "get_tool_metadata",
    "get_all_tools",
    "get_tools_by_category",
    "get_expensive_tools",
    "search_tools",
    "get_registry_stats",
    "register_tool",
    
    # Artifact
    "Artifact",
    "ArtifactType",
    "ArtifactFormat",
    "ArtifactStatus",
    "ArtifactVersion",
    "Canvas",
    
    # Workflow State
    "BaseWorkflowState",
    "Mode1State",
    "Mode2State",
    "Mode3State",
    "Mode4State",
    "validate_base_state",
    "initialize_base_state",
    "initialize_mode1_state",
    "initialize_mode2_state",
    "initialize_mode3_state",
    "initialize_mode4_state",
]

