"""
Elasticsearch Client for GraphRAG
Handles full-text keyword search with BM25 ranking
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import structlog

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


@dataclass
class KeywordSearchResult:
    """Result from keyword search"""
    id: str
    score: float
    text: str
    highlights: List[str]
    metadata: Dict[str, Any]


class ElasticClient:
    """
    Elasticsearch client for keyword search
    
    Note: This is a mock implementation until Elasticsearch is deployed
    
    Features:
    - BM25 ranking
    - Highlighting
    - Faceted search
    - Health checks
    """
    
    def __init__(
        self,
        hosts: Optional[List[str]] = None,
        api_key: Optional[str] = None,
        index_name: str = "vital-medical-docs"
    ):
        """
        Initialize Elasticsearch client
        
        Args:
            hosts: List of Elasticsearch hosts
            api_key: API key for authentication
            index_name: Index name for medical documents
        """
        # Parse hosts from env var (comma-separated string) or use provided list
        if hosts:
            self.hosts = hosts
        elif settings.elasticsearch_hosts:
            self.hosts = [h.strip() for h in settings.elasticsearch_hosts.split(",")]
        else:
            self.hosts = []
        self.api_key = api_key or settings.elasticsearch_api_key or None
        self.index_name = index_name
        self._client = None
        self._is_mock = True  # Set to False when Elasticsearch is deployed
        
        logger.info(
            "elastic_client_initialized",
            hosts=self.hosts,
            index_name=index_name,
            is_mock=self._is_mock
        )
    
    async def connect(self):
        """Initialize Elasticsearch connection"""
        if self._is_mock:
            logger.warning("elasticsearch_mock_mode_active")
            return
        
        try:
            from elasticsearch import AsyncElasticsearch  # type: ignore
            
            self._client = AsyncElasticsearch(
                hosts=self.hosts,
                api_key=self.api_key
            )
            
            # Verify connection
            info = await self._client.info()
            
            logger.info(
                "elasticsearch_connected",
                version=info.get('version', {}).get('number'),
                cluster_name=info.get('cluster_name')
            )
            
        except ImportError:
            logger.error("elasticsearch_library_not_installed")
            raise ImportError("Install elasticsearch: pip install elasticsearch")
        except Exception as e:
            logger.error("elasticsearch_connection_failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Close Elasticsearch connection"""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("elasticsearch_disconnected")
    
    async def health_check(self) -> bool:
        """
        Check if Elasticsearch is healthy
        
        Returns:
            True if cluster is responsive
        """
        if self._is_mock:
            return True
        
        try:
            if self._client:
                health = await self._client.cluster.health()  # type: ignore
                status = health.get('status')
                return status in ['green', 'yellow']
            return False
        except Exception as e:
            logger.error("elasticsearch_health_check_failed", error=str(e))
            return False
    
    async def search(
        self,
        query: str,
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
        min_score: float = 0.0,
        highlight: bool = True
    ) -> List[KeywordSearchResult]:
        """
        Keyword search with BM25 ranking
        
        Args:
            query: Search query string
            top_k: Number of results to return
            filter_dict: Optional metadata filters
            min_score: Minimum BM25 score threshold
            highlight: Include highlights in results
            
        Returns:
            List of search results
        """
        if self._is_mock:
            return await self._search_mock(query, top_k)
        
        try:
            # Build Elasticsearch query
            es_query = {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "multi_match": {
                                    "query": query,
                                    "fields": ["text^3", "title^2", "content"],
                                    "type": "best_fields",
                                    "operator": "or"
                                }
                            }
                        ],
                        "filter": []
                    }
                },
                "size": top_k,
                "min_score": min_score
            }
            
            # Add filters
            if filter_dict:
                for key, value in filter_dict.items():
                    es_query["query"]["bool"]["filter"].append({
                        "term": {f"metadata.{key}": value}
                    })
            
            # Add highlighting
            if highlight:
                es_query["highlight"] = {
                    "fields": {
                        "text": {"pre_tags": ["<mark>"], "post_tags": ["</mark>"]},
                        "content": {"pre_tags": ["<mark>"], "post_tags": ["</mark>"]}
                    },
                    "number_of_fragments": 3,
                    "fragment_size": 150
                }
            
            # Execute search
            if self._client:
                response = await self._client.search(  # type: ignore
                    index=self.index_name,
                    body=es_query
                )
            else:
                return []
            
            # Parse results
            results = []
            for hit in response['hits']['hits']:
                highlights = []
                if 'highlight' in hit:
                    for field, fragments in hit['highlight'].items():
                        highlights.extend(fragments)
                
                results.append(KeywordSearchResult(
                    id=hit['_id'],
                    score=hit['_score'],
                    text=hit['_source'].get('text', ''),
                    highlights=highlights,
                    metadata=hit['_source'].get('metadata', {})
                ))
            
            logger.info(
                "elasticsearch_search_success",
                query=query[:50],
                results_count=len(results)
            )
            
            return results
            
        except Exception as e:
            logger.error(
                "elasticsearch_search_failed",
                query=query[:50],
                error=str(e)
            )
            raise
    
    async def _search_mock(
        self,
        query: str,
        top_k: int
    ) -> List[KeywordSearchResult]:
        """
        Mock keyword search (returns empty results)
        
        This is a placeholder until Elasticsearch is deployed.
        In production, this should be replaced with real search.
        """
        logger.info(
            "elasticsearch_mock_search",
            query=query[:50],
            note="Returning empty results - Elasticsearch not deployed"
        )
        
        # Return empty results
        # In a real implementation, this would perform BM25 search
        return []
    
    async def index_documents(
        self,
        documents: List[Dict[str, Any]]
    ) -> None:
        """
        Index documents
        
        Args:
            documents: List of documents to index
        """
        if self._is_mock:
            logger.warning("elasticsearch_mock_mode_skipping_indexing")
            return
        
        try:
            from elasticsearch.helpers import async_bulk  # type: ignore
            
            actions = [
                {
                    "_index": self.index_name,
                    "_id": doc.get("id"),
                    "_source": doc
                }
                for doc in documents
            ]
            
            success, failed = await async_bulk(self._client, actions)
            
            logger.info(
                "elasticsearch_index_success",
                success_count=success,
                failed_count=len(failed)
            )
            
        except Exception as e:
            logger.error("elasticsearch_index_failed", error=str(e))
            raise


# Singleton instance
_elastic_client: Optional[ElasticClient] = None


async def get_elastic_client() -> ElasticClient:
    """Get or create Elasticsearch client singleton"""
    global _elastic_client
    
    if _elastic_client is None:
        _elastic_client = ElasticClient()
        await _elastic_client.connect()
    
    return _elastic_client


# Alias for backward compatibility
ElasticsearchClient = ElasticClient

