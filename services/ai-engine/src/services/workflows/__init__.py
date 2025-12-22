"""
Workflow Execution Services

Mission execution, HITL, and autonomous workflow services.

Components:
- Mission service and repository
- Autonomous controller and enhancements
- HITL (Human-in-the-Loop) services
- Artifact generation
- Runner registry
- DeepAgents tools (VirtualFilesystem)

Note: Uses lazy imports to avoid circular dependencies.
"""

# Lazy imports to avoid circular dependencies
def __getattr__(name: str):
    """Lazy import for workflow services."""
    if name == "MissionService":
        from .mission_service import MissionService
        return MissionService
    elif name == "MissionRepository":
        from .mission_repository import MissionRepository
        return MissionRepository
    elif name == "AutonomousController":
        from .autonomous_controller import AutonomousController
        return AutonomousController
    elif name == "AutonomyLevel":
        from .autonomous_enhancements import AutonomyLevel
        return AutonomyLevel
    elif name == "AutonomyConfig":
        from .autonomous_enhancements import AutonomyConfig
        return AutonomyConfig
    elif name == "ConfidenceCalibrator":
        from .autonomous_enhancements import ConfidenceCalibrator
        return ConfidenceCalibrator
    elif name == "RecursiveDecomposer":
        from .autonomous_enhancements import RecursiveDecomposer
        return RecursiveDecomposer
    elif name == "ErrorRecoveryService":
        from .autonomous_enhancements import ErrorRecoveryService
        return ErrorRecoveryService
    elif name == "AgentCollaborator":
        from .autonomous_enhancements import AgentCollaborator
        return AgentCollaborator
    elif name == "HITLService":
        from .hitl_service import HITLService
        return HITLService
    elif name == "HITLConnectionManager":
        from .hitl_websocket_service import HITLConnectionManager
        return HITLConnectionManager
    elif name == "EnhancedHITLService":
        from .hitl_websocket_service import EnhancedHITLService
        return EnhancedHITLService
    elif name == "ArtifactGenerator":
        from .artifact_generator import ArtifactGenerator
        return ArtifactGenerator
    elif name == "RunnerRegistry":
        from .runner_registry import RunnerRegistry
        return RunnerRegistry
    elif name == "DeepAgentsTools":
        from .deepagents_tools import DeepAgentsTools
        return DeepAgentsTools
    elif name == "VirtualFilesystem":
        from .deepagents_tools import VirtualFilesystem
        return VirtualFilesystem
    raise AttributeError(f"module 'services.workflows' has no attribute '{name}'")


__all__ = [
    "MissionService",
    "MissionRepository",
    "AutonomousController",
    "AutonomyLevel",
    "AutonomyConfig",
    "ConfidenceCalibrator",
    "RecursiveDecomposer",
    "ErrorRecoveryService",
    "AgentCollaborator",
    "HITLService",
    "HITLConnectionManager",
    "EnhancedHITLService",
    "ArtifactGenerator",
    "RunnerRegistry",
    "DeepAgentsTools",
    "VirtualFilesystem",
]
