"""
RAG Service Interface

Defines the contract for Retrieval Augmented Generation operations.
All RAG service implementations must implement this interface.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Union, List


class IRAGService(ABC):
    """
    Interface for RAG (Retrieval Augmented Generation) operations.
    
    Provides standardized citation format and consistent behavior
    across all modes and services.
    """
    
    @abstractmethod
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
        Query knowledge base and return standardized response.
        
        Args:
            query_text: User's search query
            strategy: Search strategy - "hybrid", "semantic", or "keyword"
            domain_ids: List of domain IDs to search (None = search all)
            max_results: Maximum number of results to return
            similarity_threshold: Minimum similarity score (0.0-1.0)
            **kwargs: Additional search parameters
            
        Returns:
            RAGResponse with standardized citations or RAGEmptyResponse if no results
            
        Example:
            >>> response = await rag_service.query(
            ...     query_text="What are FDA 510(k) requirements?",
            ...     domain_ids=["regulatory"],
            ...     max_results=10
            ... )
            >>> if response.has_sources():
            ...     for citation in response.citations:
            ...         print(f"{citation.inline_ref} {citation.title}")
        """
        pass
    
    @abstractmethod
    async def search_by_agent(
        self,
        query_text: str,
        agent_id: str,
        tenant_id: str,
        max_results: int = 10,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Search using agent's configured knowledge domains.
        
        Args:
            query_text: User's search query
            agent_id: Agent whose domains to search
            tenant_id: Tenant identifier
            max_results: Maximum results
            **kwargs: Additional parameters
            
        Returns:
            RAGResponse with citations
        """
        pass
    
    @abstractmethod
    async def rerank_results(
        self,
        query_text: str,
        results: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Rerank search results for better relevance.
        
        Args:
            query_text: Original query
            results: Initial search results
            top_k: Number of top results to return
            
        Returns:
            Reranked results
        """
        pass
    
    @abstractmethod
    async def get_related_documents(
        self,
        document_id: str,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find documents related to a given document.
        
        Args:
            document_id: Source document ID
            max_results: Maximum related documents
            
        Returns:
            List of related documents
        """
        pass
    
    @abstractmethod
    async def update_document(
        self,
        document_id: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """
        Update a document in the knowledge base.
        
        Args:
            document_id: Document to update
            content: New content
            metadata: New metadata
            
        Returns:
            True if successful
        """
        pass
    
    @abstractmethod
    async def delete_document(
        self,
        document_id: str
    ) -> bool:
        """
        Delete a document from the knowledge base.
        
        Args:
            document_id: Document to delete
            
        Returns:
            True if successful
        """
        pass
    
    @abstractmethod
    async def get_index_stats(
        self,
        domain_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get statistics about the knowledge base.
        
        Args:
            domain_id: Specific domain (None = all domains)
            
        Returns:
            Stats including total documents, dimensions, etc.
        """
        pass

