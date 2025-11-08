"""
Unified RAG Service (vital_shared wrapper)

Wraps the existing UnifiedRAGService to implement IRAGService interface.
Provides standardized Citation format for all RAG responses.
"""

from typing import Dict, Any, List, Optional, Union
import structlog

from vital_shared.interfaces.rag_service import IRAGService
from vital_shared.models.citation import Citation, RAGResponse, RAGEmptyResponse, SourceType
from services.unified_rag_service import UnifiedRAGService as LegacyRAGService
from services.supabase_client import SupabaseClient
from datetime import datetime

logger = structlog.get_logger()


class UnifiedRAGService(IRAGService):
    """
    Standardized RAG service implementing IRAGService.
    
    Wraps the existing UnifiedRAGService and converts responses
    to standardized Citation format.
    
    Usage:
        >>> service = UnifiedRAGService(supabase_client, pinecone_client)
        >>> await service.initialize()
        >>> response = await service.query(
        ...     query_text="What are FDA 510(k) requirements?",
        ...     domain_ids=["regulatory"],
        ...     max_results=10
        ... )
        >>> if response.has_sources():
        ...     for citation in response.citations:
        ...         print(f"{citation.inline_ref} {citation.title}")
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager=None,
        embedding_model: Optional[str] = None
    ):
        """
        Initialize service.
        
        Args:
            supabase_client: Supabase client
            cache_manager: Optional cache manager
            embedding_model: Optional embedding model name
        """
        self.legacy_service = LegacyRAGService(
            supabase_client=supabase_client,
            cache_manager=cache_manager,
            embedding_model=embedding_model
        )
        self.logger = logger.bind(service="UnifiedRAGService")
    
    async def initialize(self) -> bool:
        """Initialize the service"""
        return await self.legacy_service.initialize()
    
    async def query(
        self,
        query_text: str,
        strategy: str = "hybrid",
        domain_ids: Optional[List[str]] = None,
        max_results: int = 10,
        similarity_threshold: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Query knowledge base with standardized response.
        
        Args:
            query_text: Search query
            strategy: "hybrid", "semantic", or "keyword"
            domain_ids: Domain IDs to search
            max_results: Maximum results
            similarity_threshold: Minimum similarity (0.0-1.0)
            **kwargs: Additional parameters
            
        Returns:
            RAGResponse or RAGEmptyResponse
        """
        try:
            start_time = datetime.now()
            
            self.logger.info(
                "rag_query_started",
                query=query_text,
                strategy=strategy,
                domains=domain_ids,
                max_results=max_results
            )
            
            # Call legacy service
            raw_response = await self.legacy_service.query(
                query_text=query_text,
                domain_ids=domain_ids,
                max_results=max_results,
                similarity_threshold=similarity_threshold,
                strategy=strategy
            )
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Convert to standardized format
            if raw_response and len(raw_response) > 0:
                return self._convert_to_rag_response(
                    raw_response,
                    query_text,
                    strategy,
                    domain_ids or [],
                    processing_time
                )
            else:
                return self._create_empty_response(
                    query_text,
                    strategy,
                    domain_ids or [],
                    "No sources found matching the query"
                )
        
        except Exception as e:
            self.logger.error(
                "rag_query_failed",
                query=query_text,
                error=str(e)
            )
            return self._create_empty_response(
                query_text,
                strategy,
                domain_ids or [],
                f"Error during search: {str(e)}"
            )
    
    async def search_by_agent(
        self,
        query_text: str,
        agent_id: str,
        tenant_id: str,
        max_results: int = 10,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Search using agent's configured domains.
        
        Args:
            query_text: Search query
            agent_id: Agent ID
            tenant_id: Tenant ID
            max_results: Maximum results
            **kwargs: Additional parameters
            
        Returns:
            RAGResponse or RAGEmptyResponse
        """
        # Get agent's domains from AgentService
        # For now, delegate to standard query
        return await self.query(
            query_text=query_text,
            max_results=max_results,
            **kwargs
        )
    
    async def rerank_results(
        self,
        query_text: str,
        results: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Rerank search results.
        
        Args:
            query_text: Original query
            results: Initial results
            top_k: Number of top results
            
        Returns:
            Reranked results
        """
        # Sort by similarity score
        sorted_results = sorted(
            results,
            key=lambda x: x.get("similarity_score", 0.0),
            reverse=True
        )
        return sorted_results[:top_k]
    
    async def get_related_documents(
        self,
        document_id: str,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Find documents related to a given document."""
        # Not implemented in legacy service
        return []
    
    async def update_document(
        self,
        document_id: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Update a document in knowledge base."""
        # Not implemented in legacy service
        return False
    
    async def delete_document(
        self,
        document_id: str
    ) -> bool:
        """Delete a document from knowledge base."""
        # Not implemented in legacy service
        return False
    
    async def get_index_stats(
        self,
        domain_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get knowledge base statistics."""
        # Not implemented in legacy service
        return {
            "total_documents": 0,
            "total_domains": 0
        }
    
    def _convert_to_rag_response(
        self,
        raw_response: List[Dict[str, Any]],
        query_text: str,
        strategy: str,
        domains: List[str],
        processing_time_ms: float
    ) -> Dict[str, Any]:
        """Convert legacy response to standardized RAGResponse."""
        
        citations = []
        for idx, source in enumerate(raw_response, 1):
            citation = Citation(
                id=source.get("id", f"citation_{idx}"),
                inline_ref=f"[{idx}]",
                title=source.get("title", "Untitled Source"),
                content=source.get("content", source.get("text", "")),
                preview=self._create_preview(source.get("content", source.get("text", ""))),
                source_type=self._map_source_type(source.get("source", "")),
                source_url=source.get("url", source.get("source_url", "#")),
                source_name=source.get("source_name", source.get("source", "Unknown Source")),
                similarity_score=source.get("similarity_score", source.get("score", 0.0)),
                metadata=source.get("metadata", {})
            )
            citations.append(citation)
        
        # Calculate overall confidence (average similarity)
        avg_confidence = sum(c.similarity_score for c in citations) / len(citations) if citations else 0.0
        
        response = RAGResponse(
            answer=None,  # No answer generated yet
            citations=citations,
            total_sources=len(citations),
            search_strategy=strategy,
            confidence=avg_confidence,
            domains_searched=domains,
            query_text=query_text,
            processing_time_ms=processing_time_ms
        )
        
        return response.to_dict()
    
    def _create_empty_response(
        self,
        query_text: str,
        strategy: str,
        domains: List[str],
        reason: str
    ) -> Dict[str, Any]:
        """Create standardized empty response."""
        
        response = RAGEmptyResponse(
            query_text=query_text,
            reason=reason,
            suggestions=[
                "Try using different keywords",
                "Broaden your search terms",
                "Check if you're searching the correct domains",
                "Try using synonyms or related terms"
            ],
            domains_searched=domains,
            search_strategy=strategy
        )
        
        return response.to_dict()
    
    def _create_preview(self, content: str, max_length: int = 200) -> str:
        """Create preview text from content."""
        if len(content) <= max_length:
            return content
        return content[:max_length].rsplit(' ', 1)[0] + "..."
    
    def _map_source_type(self, source_name: str) -> SourceType:
        """Map source name to SourceType enum."""
        source_lower = source_name.lower()
        
        if "fda" in source_lower:
            return SourceType.FDA
        elif "pubmed" in source_lower:
            return SourceType.PUBMED
        elif "clinical" in source_lower or "trial" in source_lower:
            return SourceType.CLINICAL_TRIAL
        elif "guideline" in source_lower:
            return SourceType.GUIDELINE
        elif "research" in source_lower or "paper" in source_lower:
            return SourceType.RESEARCH_PAPER
        elif "regulatory" in source_lower:
            return SourceType.REGULATORY_DOCUMENT
        else:
            return SourceType.WEB_SOURCE

