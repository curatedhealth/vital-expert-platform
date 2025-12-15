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

        # Auto-enable when credentials are available
        # Mock mode is disabled when both hosts and API key are configured
        self._is_mock = not (self.hosts and self.api_key)

        logger.info(
            "elastic_client_initialized",
            hosts=self.hosts[:1] if self.hosts else [],  # Log only first host for security
            index_name=index_name,
            is_mock=self._is_mock,
            has_api_key=bool(self.api_key)
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
        highlight: bool = True,
        use_semantic: bool = False
    ) -> List[KeywordSearchResult]:
        """
        Search with BM25 ranking or semantic search

        Args:
            query: Search query string
            top_k: Number of results to return
            filter_dict: Optional metadata filters
            min_score: Minimum score threshold
            highlight: Include highlights in results
            use_semantic: Use semantic search (ML-powered) instead of BM25

        Returns:
            List of search results
        """
        if self._is_mock:
            return await self._search_mock(query, top_k)

        try:
            if use_semantic:
                return await self._search_semantic(query, top_k, filter_dict)
            else:
                return await self._search_bm25(query, top_k, filter_dict, min_score, highlight)

        except Exception as e:
            logger.error(
                "elasticsearch_search_failed",
                query=query[:50],
                error=str(e),
                search_type="semantic" if use_semantic else "bm25"
            )
            raise

    async def _search_bm25(
        self,
        query: str,
        top_k: int,
        filter_dict: Optional[Dict[str, Any]],
        min_score: float,
        highlight: bool
    ) -> List[KeywordSearchResult]:
        """BM25 keyword search"""
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

        if filter_dict:
            for key, value in filter_dict.items():
                es_query["query"]["bool"]["filter"].append({
                    "term": {f"metadata.{key}": value}
                })

        if highlight:
            es_query["highlight"] = {
                "fields": {
                    "text": {"pre_tags": ["<mark>"], "post_tags": ["</mark>"]},
                    "content": {"pre_tags": ["<mark>"], "post_tags": ["</mark>"]}
                },
                "number_of_fragments": 3,
                "fragment_size": 150
            }

        if self._client:
            response = await self._client.search(  # type: ignore
                index=self.index_name,
                body=es_query
            )
        else:
            return []

        return self._parse_search_results(response)

    async def _search_semantic(
        self,
        query: str,
        top_k: int,
        filter_dict: Optional[Dict[str, Any]]
    ) -> List[KeywordSearchResult]:
        """Semantic search using Elastic ML models"""
        # Use retriever API for semantic search
        retriever = {
            "standard": {
                "query": {
                    "semantic": {
                        "field": "text",
                        "query": query
                    }
                }
            }
        }

        if self._client:
            response = await self._client.search(  # type: ignore
                index=self.index_name,
                retriever=retriever,
                size=top_k
            )
        else:
            return []

        return self._parse_search_results(response)

    def _parse_search_results(self, response: Dict[str, Any]) -> List[KeywordSearchResult]:
        """Parse Elasticsearch response into KeywordSearchResult list"""
        results = []
        for hit in response.get('hits', {}).get('hits', []):
            highlights = []
            if 'highlight' in hit:
                for field, fragments in hit['highlight'].items():
                    highlights.extend(fragments)

            results.append(KeywordSearchResult(
                id=hit['_id'],
                score=hit['_score'] or 0.0,
                text=hit['_source'].get('text', ''),
                highlights=highlights,
                metadata=hit['_source'].get('metadata', {})
            ))

        logger.info(
            "elasticsearch_search_success",
            results_count=len(results),
            top_score=results[0].score if results else 0.0
        )

        return results
    
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
    
    async def create_index_if_not_exists(
        self,
        use_semantic_text: bool = True
    ) -> bool:
        """
        Create the index with appropriate mappings if it doesn't exist

        Args:
            use_semantic_text: Use semantic_text field type for ML-powered search

        Returns:
            True if index exists or was created successfully
        """
        if self._is_mock or not self._client:
            logger.warning("elasticsearch_mock_mode_skipping_index_creation")
            return False

        try:
            # Check if index exists
            exists = await self._client.indices.exists(index=self.index_name)  # type: ignore
            if exists:
                logger.info("elasticsearch_index_exists", index=self.index_name)
                return True

            # Create index with mappings
            mappings = {
                "properties": {
                    "text": {
                        "type": "semantic_text" if use_semantic_text else "text"
                    },
                    "title": {"type": "text"},
                    "content": {"type": "text"},
                    "chunk_id": {"type": "keyword"},
                    "document_id": {"type": "keyword"},
                    "namespace": {"type": "keyword"},
                    "source_type": {"type": "keyword"},
                    "metadata": {"type": "object", "enabled": True}
                }
            }

            await self._client.indices.create(  # type: ignore
                index=self.index_name,
                mappings=mappings
            )

            logger.info(
                "elasticsearch_index_created",
                index=self.index_name,
                semantic_enabled=use_semantic_text
            )
            return True

        except Exception as e:
            logger.error("elasticsearch_index_creation_failed", error=str(e))
            return False

    async def index_documents(
        self,
        documents: List[Dict[str, Any]],
        wait_for_refresh: bool = True
    ) -> Dict[str, int]:
        """
        Index documents with bulk API

        Args:
            documents: List of documents to index
            wait_for_refresh: Wait for indexed docs to be searchable

        Returns:
            Dict with success/failed counts
        """
        if self._is_mock:
            logger.warning("elasticsearch_mock_mode_skipping_indexing")
            return {"success": 0, "failed": 0}

        try:
            from elasticsearch.helpers import async_bulk  # type: ignore

            actions = [
                {
                    "_index": self.index_name,
                    "_id": doc.get("id") or doc.get("chunk_id"),
                    "_source": doc
                }
                for doc in documents
            ]

            # Use longer timeout for semantic indexing (ML model needs time)
            client_with_timeout = self._client.options(request_timeout=300)  # type: ignore

            success, failed = await async_bulk(
                client_with_timeout,
                actions,
                refresh="wait_for" if wait_for_refresh else False
            )

            result = {"success": success, "failed": len(failed) if failed else 0}

            logger.info(
                "elasticsearch_index_success",
                success_count=result["success"],
                failed_count=result["failed"]
            )

            return result

        except Exception as e:
            logger.error("elasticsearch_index_failed", error=str(e))
            raise

    async def get_index_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        if self._is_mock or not self._client:
            return {"mock_mode": True}

        try:
            stats = await self._client.indices.stats(index=self.index_name)  # type: ignore
            return {
                "doc_count": stats["_all"]["primaries"]["docs"]["count"],
                "size_bytes": stats["_all"]["primaries"]["store"]["size_in_bytes"],
                "index_name": self.index_name
            }
        except Exception as e:
            logger.error("elasticsearch_stats_failed", error=str(e))
            return {"error": str(e)}


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

