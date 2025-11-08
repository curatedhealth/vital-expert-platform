"""
VITAL Shared Interfaces

Abstract base classes defining contracts for all services.
All service implementations must implement these interfaces.
"""

from vital_shared.interfaces.agent_service import IAgentService
from vital_shared.interfaces.rag_service import IRAGService
from vital_shared.interfaces.tool_service import IToolService
from vital_shared.interfaces.memory_service import IMemoryService
from vital_shared.interfaces.streaming_service import IStreamingService
from vital_shared.interfaces.artifact_service import IArtifactService

__all__ = [
    "IAgentService",
    "IRAGService",
    "IToolService",
    "IMemoryService",
    "IStreamingService",
    "IArtifactService",
]

