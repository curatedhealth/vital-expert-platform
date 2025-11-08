"""
Artifact Models

Defines artifacts (documents, code, diagrams) and canvas structures.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime


class ArtifactType(str, Enum):
    """Type of artifact"""
    DOCUMENT = "document"
    CODE = "code"
    DIAGRAM = "diagram"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    CUSTOM = "custom"


class ArtifactFormat(str, Enum):
    """Artifact format"""
    # Documents
    PDF = "pdf"
    DOCX = "docx"
    MARKDOWN = "markdown"
    HTML = "html"
    
    # Code
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    CPP = "cpp"
    
    # Diagrams
    MERMAID = "mermaid"
    PLANTUML = "plantuml"
    SVG = "svg"
    PNG = "png"
    
    # Data
    JSON = "json"
    CSV = "csv"
    XLSX = "xlsx"


class ArtifactStatus(str, Enum):
    """Artifact status"""
    DRAFT = "draft"
    GENERATING = "generating"
    READY = "ready"
    ERROR = "error"
    ARCHIVED = "archived"


class ArtifactVersion(BaseModel):
    """
    Artifact version for version control.
    """
    
    id: str = Field(..., description="Version ID")
    artifact_id: str = Field(..., description="Parent artifact ID")
    version_number: int = Field(..., description="Version number")
    
    # Content
    content: str = Field(..., description="Artifact content")
    content_hash: str = Field(..., description="Content hash for change detection")
    
    # Metadata
    change_description: Optional[str] = Field(None, description="What changed")
    created_by: str = Field(..., description="User or system that created version")
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Size
    size_bytes: int = Field(0, description="Content size in bytes")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "artifactId": self.artifact_id,
            "versionNumber": self.version_number,
            "content": self.content,
            "contentHash": self.content_hash,
            "changeDescription": self.change_description,
            "createdBy": self.created_by,
            "createdAt": self.created_at.isoformat(),
            "sizeBytes": self.size_bytes
        }


class Artifact(BaseModel):
    """
    Artifact (generated document, code, diagram).
    
    Used by ArtifactService for generation and canvas integration.
    """
    
    # Identity
    id: str = Field(..., description="Unique artifact ID")
    title: str = Field(..., description="Artifact title")
    description: Optional[str] = Field(None, description="Artifact description")
    
    # Type & Format
    artifact_type: ArtifactType = Field(..., description="Type of artifact")
    format: ArtifactFormat = Field(..., description="Artifact format")
    status: ArtifactStatus = Field(ArtifactStatus.DRAFT, description="Artifact status")
    
    # Content
    content: str = Field(..., description="Current content")
    content_hash: str = Field(..., description="Content hash")
    current_version: int = Field(1, description="Current version number")
    
    # Template
    template_id: Optional[str] = Field(None, description="Template used for generation")
    template_data: Dict[str, Any] = Field(default_factory=dict, description="Template data")
    
    # Ownership
    session_id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="User ID")
    tenant_id: str = Field(..., description="Tenant ID")
    agent_id: Optional[str] = Field(None, description="Agent that generated it")
    
    # Canvas integration
    canvas_id: Optional[str] = Field(None, description="Canvas ID if in canvas")
    
    # Generation metadata
    generation_prompt: Optional[str] = Field(None, description="Prompt used for generation")
    generation_time_ms: Optional[float] = Field(None, description="Generation time")
    generation_tokens: int = Field(0, description="Tokens used")
    generation_cost_usd: float = Field(0.0, description="Generation cost")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def to_display_format(self) -> Dict[str, Any]:
        """Format for frontend display"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "type": self.artifact_type.value,
            "format": self.format.value,
            "status": self.status.value,
            "content": self.content,
            "contentHash": self.content_hash,
            "currentVersion": self.current_version,
            "templateId": self.template_id,
            "sessionId": self.session_id,
            "canvasId": self.canvas_id,
            "generationPrompt": self.generation_prompt,
            "generationTimeMs": self.generation_time_ms,
            "generationTokens": self.generation_tokens,
            "generationCostUsd": self.generation_cost_usd,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
            "metadata": self.metadata
        }


class Canvas(BaseModel):
    """
    Canvas for collaborative editing and artifact management.
    """
    
    id: str = Field(..., description="Canvas ID")
    title: str = Field(..., description="Canvas title")
    canvas_type: ArtifactType = Field(..., description="Canvas type")
    
    # Content
    artifact_id: str = Field(..., description="Current artifact ID")
    current_version: int = Field(1, description="Current version")
    
    # Ownership
    session_id: str = Field(..., description="Session ID")
    user_id: str = Field(..., description="Owner user ID")
    tenant_id: str = Field(..., description="Tenant ID")
    
    # Collaboration
    collaborators: List[str] = Field(default_factory=list, description="Collaborator user IDs")
    is_locked: bool = Field(False, description="Canvas is locked")
    locked_by: Optional[str] = Field(None, description="User who locked it")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_edited_at: Optional[datetime] = Field(None)
    last_edited_by: Optional[str] = Field(None)
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "canvasType": self.canvas_type.value,
            "artifactId": self.artifact_id,
            "currentVersion": self.current_version,
            "sessionId": self.session_id,
            "userId": self.user_id,
            "tenantId": self.tenant_id,
            "collaborators": self.collaborators,
            "isLocked": self.is_locked,
            "lockedBy": self.locked_by,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
            "lastEditedAt": self.last_edited_at.isoformat() if self.last_edited_at else None,
            "lastEditedBy": self.last_edited_by,
            "metadata": self.metadata
        }

