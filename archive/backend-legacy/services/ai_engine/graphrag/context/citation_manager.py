"""
Citation Manager for GraphRAG

Manages citation IDs and evidence trails for context chunks
"""

from typing import Dict, List, Optional
from dataclasses import dataclass

from ..utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class Citation:
    """Citation metadata for a source"""
    id: str  # e.g., "[1]", "[2]"
    source_id: str  # Original source ID
    source_type: str  # 'vector', 'keyword', 'graph'
    title: Optional[str] = None
    url: Optional[str] = None
    metadata: Optional[Dict] = None


class CitationManager:
    """Manages citations and evidence trails"""
    
    def __init__(self):
        self.citations: Dict[str, Citation] = {}
        self.next_citation_id = 1
        
    def add_citation(
        self,
        source_id: str,
        source_type: str,
        title: Optional[str] = None,
        url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Add a citation and return its ID
        
        Args:
            source_id: Original source ID
            source_type: Type of source ('vector', 'keyword', 'graph')
            title: Optional title for citation
            url: Optional URL for citation
            metadata: Optional metadata dict
            
        Returns:
            Citation ID (e.g., "[1]")
        """
        # Check if citation already exists
        for citation in self.citations.values():
            if citation.source_id == source_id and citation.source_type == source_type:
                return citation.id
                
        # Create new citation
        citation_id = f"[{self.next_citation_id}]"
        self.next_citation_id += 1
        
        citation = Citation(
            id=citation_id,
            source_id=source_id,
            source_type=source_type,
            title=title,
            url=url,
            metadata=metadata
        )
        
        self.citations[citation_id] = citation
        
        logger.debug(f"Added citation {citation_id} for {source_type} source {source_id}")
        
        return citation_id
        
    def get_citation(self, citation_id: str) -> Optional[Citation]:
        """Get citation by ID"""
        return self.citations.get(citation_id)
        
    def get_all_citations(self) -> List[Citation]:
        """Get all citations as a list"""
        return list(self.citations.values())
        
    def format_bibliography(self) -> str:
        """
        Format all citations as a bibliography
        
        Returns:
            Formatted bibliography string
        """
        if not self.citations:
            return ""
            
        lines = ["## Sources"]
        
        for citation in sorted(self.citations.values(), key=lambda c: int(c.id.strip('[]'))):
            # Build citation line
            line_parts = [f"{citation.id}"]
            
            if citation.title:
                line_parts.append(citation.title)
            else:
                line_parts.append(f"{citation.source_type.capitalize()} Source")
                
            if citation.url:
                line_parts.append(f"({citation.url})")
                
            lines.append(" ".join(line_parts))
            
        return "\n".join(lines)
        
    def reset(self):
        """Reset citation manager (for new query)"""
        self.citations.clear()
        self.next_citation_id = 1

