"""
VITAL Shared Library
====================

Shared services, models, and utilities for VITAL AI platform.

Used across:
- Ask Expert (all 4 modes)
- Ask Panel
- Pharma Intelligence
- Other VITAL services

Benefits:
- Build once, use everywhere
- Consistent behavior across services
- Easy testing and maintenance
- Single source of truth

Author: VITAL Path Team
Version: 1.0.0
"""

__version__ = "1.0.0"
__author__ = "VITAL Path Team"

# Export interfaces
from vital_shared.interfaces.agent_service import IAgentService
from vital_shared.interfaces.rag_service import IRAGService
from vital_shared.interfaces.tool_service import IToolService
from vital_shared.interfaces.memory_service import IMemoryService
from vital_shared.interfaces.streaming_service import IStreamingService
from vital_shared.interfaces.artifact_service import IArtifactService

# Export service implementations
from vital_shared.services.agent_service import AgentService
from vital_shared.services.unified_rag_service import UnifiedRAGService
from vital_shared.services.tool_service_stub import ToolService  # Stub for testing
from vital_shared.services.memory_service import MemoryService
from vital_shared.services.streaming_service import StreamingService
from vital_shared.services.artifact_service import ArtifactService

# Export models
from vital_shared.models.agent import AgentProfile, AgentCapability
from vital_shared.models.citation import Citation, RAGResponse, RAGEmptyResponse, SourceType
from vital_shared.models.message import Message, ConversationTurn
from vital_shared.models.tool import ToolMetadata, ToolExecutionResult, ToolCategory, ToolCostTier, ToolExecutionSpeed
from vital_shared.models.artifact import Artifact, ArtifactVersion
from vital_shared.models.workflow_state import (
    BaseWorkflowState,
    Mode1State,
    Mode2State,
    Mode3State,
    Mode4State
)

# Export registry
from vital_shared.registry.service_registry import ServiceRegistry, initialize_services

# Export base workflow
from vital_shared.workflows.base_workflow import BaseWorkflow

__all__ = [
    # Version info
    "__version__",
    "__author__",
    
    # Interfaces
    "IAgentService",
    "IRAGService",
    "IToolService",
    "IMemoryService",
    "IStreamingService",
    "IArtifactService",
    
    # Services
    "AgentService",
    "UnifiedRAGService",
    "ToolService",
    "MemoryService",
    "StreamingService",
    "ArtifactService",
    
    # Models - Agent
    "AgentProfile",
    "AgentCapability",
    
    # Models - Citation
    "Citation",
    "RAGResponse",
    "RAGEmptyResponse",
    "SourceType",
    
    # Models - Message
    "Message",
    "ConversationTurn",
    
    # Models - Tool
    "ToolMetadata",
    "ToolExecutionResult",
    "ToolCategory",
    "ToolCostTier",
    "ToolExecutionSpeed",
    
    # Models - Artifact
    "Artifact",
    "ArtifactVersion",
    
    # Models - Workflow State
    "BaseWorkflowState",
    "Mode1State",
    "Mode2State",
    "Mode3State",
    "Mode4State",
    
    # Registry
    "ServiceRegistry",
    "initialize_services",
    
    # Workflows
    "BaseWorkflow",
]

