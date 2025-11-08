"""
Artifact Service Interface

Defines the contract for document/code/diagram generation and canvas management.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class IArtifactService(ABC):
    """Interface for artifact generation and canvas operations."""
    
    @abstractmethod
    async def generate_document(
        self,
        template_type: str,
        content: Dict[str, Any],
        format: str = "pdf"
    ) -> str:
        """
        Generate a document from template.
        
        Args:
            template_type: Template identifier (e.g., "regulatory_report")
            content: Document content and sections
            format: Output format ("pdf", "docx", "markdown")
            
        Returns:
            Artifact ID
        """
        pass
    
    @abstractmethod
    async def generate_code(
        self,
        language: str,
        specification: str,
        style: Optional[str] = None
    ) -> str:
        """
        Generate code from specification.
        
        Args:
            language: Programming language
            specification: What the code should do
            style: Code style guide
            
        Returns:
            Artifact ID
        """
        pass
    
    @abstractmethod
    async def generate_diagram(
        self,
        diagram_type: str,
        data: Dict[str, Any]
    ) -> str:
        """
        Generate diagram/visualization.
        
        Args:
            diagram_type: Type (flowchart, architecture, etc.)
            data: Diagram data
            
        Returns:
            Artifact ID
        """
        pass
    
    @abstractmethod
    async def export_artifact(
        self,
        artifact_id: str,
        export_format: str
    ) -> str:
        """
        Export artifact to specific format.
        
        Args:
            artifact_id: Artifact to export
            export_format: Target format
            
        Returns:
            Download URL
        """
        pass
    
    @abstractmethod
    async def create_canvas(
        self,
        session_id: str,
        canvas_type: str,
        title: str
    ) -> str:
        """
        Create a new canvas.
        
        Args:
            session_id: Session owning canvas
            canvas_type: Type (document, code, diagram)
            title: Canvas title
            
        Returns:
            Canvas ID
        """
        pass
    
    @abstractmethod
    async def update_canvas(
        self,
        canvas_id: str,
        content: Dict[str, Any]
    ) -> str:
        """
        Update canvas content (creates new version).
        
        Args:
            canvas_id: Canvas to update
            content: New content
            
        Returns:
            Version ID
        """
        pass
    
    @abstractmethod
    async def get_canvas(
        self,
        canvas_id: str
    ) -> Dict[str, Any]:
        """
        Get canvas with current content.
        
        Args:
            canvas_id: Canvas to retrieve
            
        Returns:
            Canvas data with content
        """
        pass
    
    @abstractmethod
    async def list_canvas_versions(
        self,
        canvas_id: str
    ) -> List[Dict[str, Any]]:
        """
        List all versions of a canvas.
        
        Args:
            canvas_id: Canvas to query
            
        Returns:
            List of versions (newest first)
        """
        pass
    
    @abstractmethod
    async def restore_canvas_version(
        self,
        canvas_id: str,
        version_id: str
    ) -> str:
        """
        Restore canvas to specific version.
        
        Args:
            canvas_id: Canvas to restore
            version_id: Version to restore to
            
        Returns:
            New version ID (restoration creates new version)
        """
        pass

