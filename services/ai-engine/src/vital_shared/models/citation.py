"""
Citation and RAG Response Models

Standardized citation format used across all VITAL services.
Ensures consistent source attribution and reference formatting.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime


class SourceType(str, Enum):
    """Source type for classification"""
    FDA = "fda"
    PUBMED = "pubmed"
    CLINICAL_TRIAL = "clinical_trial"
    GUIDELINE = "guideline"
    RESEARCH_PAPER = "research_paper"
    REGULATORY_DOCUMENT = "regulatory_document"
    WEB_SOURCE = "web_source"
    INTERNAL_DOCUMENT = "internal_document"
    CUSTOM = "custom"


class Citation(BaseModel):
    """
    Standardized citation format.
    
    Used by all modes for consistent source attribution.
    Frontend displays these using <InlineCitation> and <Sources> components.
    """
    
    # Identity
    id: str = Field(..., description="Unique citation identifier")
    inline_ref: str = Field(..., description="Inline reference (e.g., '[1]', '[2]')")
    
    # Content
    title: str = Field(..., description="Source title")
    content: str = Field(..., description="Full content or excerpt")
    preview: str = Field(..., description="Short preview (150-200 chars)")
    
    # Source
    source_type: SourceType = Field(..., description="Type of source")
    source_url: str = Field(..., description="Source URL")
    source_name: str = Field(..., description="Source name (e.g., 'FDA.gov', 'PubMed')")
    
    # Metadata
    similarity_score: float = Field(..., description="Relevance score (0.0-1.0)", ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    # Optional fields
    authors: Optional[List[str]] = Field(None, description="Authors")
    publication_date: Optional[datetime] = Field(None, description="Publication date")
    doi: Optional[str] = Field(None, description="DOI")
    pmid: Optional[str] = Field(None, description="PubMed ID")
    
    # Chicago-style formatting
    @property
    def chicago_citation(self) -> str:
        """Format as Chicago-style citation"""
        parts = []
        
        # Authors
        if self.authors:
            if len(self.authors) == 1:
                parts.append(f"{self.authors[0]}.")
            elif len(self.authors) == 2:
                parts.append(f"{self.authors[0]} and {self.authors[1]}.")
            else:
                parts.append(f"{self.authors[0]} et al.")
        
        # Title
        parts.append(f'"{self.title}."')
        
        # Source
        parts.append(self.source_name)
        
        # Date
        if self.publication_date:
            parts.append(f"({self.publication_date.year})")
        
        # URL
        parts.append(self.source_url)
        
        return " ".join(parts)
    
    def to_display_format(self) -> Dict[str, Any]:
        """Format for frontend display"""
        return {
            "id": self.id,
            "number": self.inline_ref,
            "title": self.title,
            "content": self.content,
            "preview": self.preview,
            "sourceType": self.source_type.value,
            "sourceUrl": self.source_url,
            "sourceName": self.source_name,
            "similarityScore": self.similarity_score,
            "authors": self.authors,
            "publicationDate": self.publication_date.isoformat() if self.publication_date else None,
            "doi": self.doi,
            "pmid": self.pmid,
            "chicagoCitation": self.chicago_citation,
            "metadata": self.metadata
        }


class RAGResponse(BaseModel):
    """
    Standardized RAG response with citations.
    
    Returned by UnifiedRAGService.query() when sources are found.
    """
    
    answer: Optional[str] = Field(None, description="Generated answer (if applicable)")
    citations: List[Citation] = Field(..., description="List of citations")
    total_sources: int = Field(..., description="Total sources found")
    search_strategy: str = Field(..., description="Search strategy used (hybrid/semantic/keyword)")
    confidence: float = Field(..., description="Overall confidence score (0.0-1.0)", ge=0.0, le=1.0)
    domains_searched: List[str] = Field(..., description="Domain IDs searched")
    
    # Query metadata
    query_text: str = Field(..., description="Original query")
    query_timestamp: datetime = Field(default_factory=datetime.now, description="Query timestamp")
    processing_time_ms: Optional[float] = Field(None, description="Processing time in milliseconds")
    
    def has_sources(self) -> bool:
        """Check if sources were found"""
        return len(self.citations) > 0
    
    def get_top_citations(self, n: int = 5) -> List[Citation]:
        """Get top N citations by similarity score"""
        sorted_citations = sorted(
            self.citations,
            key=lambda c: c.similarity_score,
            reverse=True
        )
        return sorted_citations[:n]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to API-friendly dictionary"""
        return {
            "answer": self.answer,
            "citations": [c.to_display_format() for c in self.citations],
            "totalSources": self.total_sources,
            "searchStrategy": self.search_strategy,
            "confidence": self.confidence,
            "domainsSearched": self.domains_searched,
            "query": self.query_text,
            "timestamp": self.query_timestamp.isoformat(),
            "processingTimeMs": self.processing_time_ms,
            "hasSources": self.has_sources()
        }


class RAGEmptyResponse(BaseModel):
    """
    Response when no sources are found.
    
    Provides helpful feedback to user about why no sources were found
    and what they can try instead.
    """
    
    query_text: str = Field(..., description="Original query")
    reason: str = Field(..., description="Why no sources were found")
    suggestions: List[str] = Field(..., description="Suggestions for better results")
    domains_searched: List[str] = Field(..., description="Domains that were searched")
    search_strategy: str = Field(..., description="Search strategy that was used")
    query_timestamp: datetime = Field(default_factory=datetime.now)
    
    def has_sources(self) -> bool:
        """Always False for empty response"""
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to API-friendly dictionary"""
        return {
            "hasSources": False,
            "query": self.query_text,
            "reason": self.reason,
            "suggestions": self.suggestions,
            "domainsSearched": self.domains_searched,
            "searchStrategy": self.search_strategy,
            "timestamp": self.query_timestamp.isoformat()
        }


class RAGSearchFilters(BaseModel):
    """Filters for RAG search"""
    
    domain_ids: Optional[List[str]] = Field(None, description="Domain IDs to search")
    source_types: Optional[List[SourceType]] = Field(None, description="Filter by source type")
    date_from: Optional[datetime] = Field(None, description="Filter by publication date (from)")
    date_to: Optional[datetime] = Field(None, description="Filter by publication date (to)")
    min_similarity: float = Field(0.7, description="Minimum similarity threshold", ge=0.0, le=1.0)
    max_results: int = Field(10, description="Maximum number of results", ge=1, le=100)
    
    # Author filters
    authors: Optional[List[str]] = Field(None, description="Filter by authors")
    
    # Metadata filters
    has_doi: Optional[bool] = Field(None, description="Filter for sources with DOI")
    is_peer_reviewed: Optional[bool] = Field(None, description="Filter for peer-reviewed sources")


class RAGSearchContext(BaseModel):
    """Context for RAG search (user, agent, session info)"""
    
    user_id: str
    tenant_id: str
    session_id: str
    agent_id: Optional[str] = None
    
    # Query context
    conversation_history: Optional[List[Dict[str, Any]]] = None
    previous_citations: Optional[List[str]] = None  # Citation IDs from previous turns

