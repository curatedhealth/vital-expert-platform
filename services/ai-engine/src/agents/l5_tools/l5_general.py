"""
VITAL Path AI Services - VITAL L5 General Tools

Unified general-purpose data source tools.
Single file handles: RAG, Web Search, World Bank.

Naming Convention:
- Class: GeneralL5Tool
- Factory: create_general_tool(source)
- Logs: vital_l5_{source}_{action}
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import structlog

from .l5_base import L5BaseTool, ToolConfig, ToolTier, L5Result

logger = structlog.get_logger()


class GeneralSource(Enum):
    """General data sources."""
    RAG = "rag"
    WEB_SEARCH = "web_search"
    WORLD_BANK = "world_bank"


# Source configurations
GENERAL_SOURCE_CONFIG = {
    GeneralSource.RAG: {
        "base_url": "",  # Internal - Supabase/Pinecone
        "cache_ttl": 1,  # Short TTL for dynamic data
        "requires_key": False,
    },
    GeneralSource.WEB_SEARCH: {
        "base_url": "https://api.tavily.com/search",
        "alt_urls": {
            "serpapi": "https://serpapi.com/search",
            "duckduckgo": None,  # Uses library
        },
        "cache_ttl": 1,
        "requires_key": False,  # DuckDuckGo fallback
    },
    GeneralSource.WORLD_BANK: {
        "base_url": "https://api.worldbank.org/v2",
        "cache_ttl": 168,  # 1 week
        "requires_key": False,
    },
}


@dataclass
class GeneralResult(L5Result):
    """Extended result for general tools."""
    # Web search result fields
    id: str = ""                      # URL or unique identifier
    title: str = ""                   # Result title
    content: str = ""                 # Full content
    source: str = ""                  # Source name (tavily, serpapi, duckduckgo)
    score: float = 0.0                # Relevance score
    url: str = ""                     # Full URL
    snippet: str = ""                 # Content snippet/summary
    published_date: Optional[str] = None
    domain: str = ""                  # Extracted domain from URL
    # World Bank specific fields
    country: str = ""
    indicator: str = ""
    year: Optional[int] = None
    value: Optional[float] = None


class GeneralL5Tool(L5BaseTool[GeneralResult]):
    """
    Unified general-purpose tool.

    Supports RAG, Web Search, and World Bank data.
    """

    def __init__(
        self,
        source: GeneralSource,
        api_key: Optional[str] = None,
        # RAG-specific
        supabase_client=None,
        pinecone_client=None,
        pinecone_index: Optional[str] = None,
        embedding_service=None,
        use_pinecone: bool = False,
        # Web search specific
        tavily_key: Optional[str] = None,
        serpapi_key: Optional[str] = None,
        **kwargs
    ):
        source_config = GENERAL_SOURCE_CONFIG[source]

        # Create ToolConfig for base class
        tool_config = ToolConfig(
            id=f"L5-{source.value.upper()}",
            name=f"General {source.value.title()} Tool",
            slug=source.value,
            description=f"General-purpose {source.value} search tool",
            category="general",
            tier=2,
            base_url=source_config.get("base_url", ""),
            cache_ttl=source_config.get("cache_ttl", 24) * 3600,  # Convert hours to seconds
        )

        super().__init__(config=tool_config)

        self.source = source
        self.source_config = source_config  # Keep source config separate from tool config
        self.source_name = source.value
        
        # RAG components
        self.supabase = supabase_client
        self.pinecone = pinecone_client
        self.pinecone_index = pinecone_index
        self.embedding_service = embedding_service
        self.use_pinecone = use_pinecone
        
        # Web search keys
        self.tavily_key = tavily_key or api_key
        self.serpapi_key = serpapi_key
        
        # Handlers
        self._search_handlers = {
            GeneralSource.RAG: self._search_rag,
            GeneralSource.WEB_SEARCH: self._search_web,
            GeneralSource.WORLD_BANK: self._search_world_bank,
        }

    async def _make_request(
        self,
        method: str,
        url: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
    ) -> Optional[Dict[str, Any]]:
        """Make HTTP request using base class client."""
        try:
            if method.upper() == "GET":
                return await self._get(url, params=params)
            elif method.upper() == "POST":
                return await self._post(url, json_data=json_data)
            return None
        except Exception as e:
            logger.error(
                f"vital_l5_{self.source_name}_request_error",
                url=url,
                error=str(e),
            )
            return None

    async def search(
        self,
        query: str,
        max_results: int = 20,
        **kwargs
    ) -> List[GeneralResult]:
        """Search general data source."""
        logger.info(
            f"vital_l5_{self.source_name}_search_start",
            query=query[:100],
            max_results=max_results,
        )

        try:
            handler = self._search_handlers.get(self.source)
            if not handler:
                return []

            results = await handler(query, max_results, **kwargs)
            logger.info(
                f"vital_l5_{self.source_name}_search_complete",
                result_count=len(results),
            )
            return results

        except Exception as e:
            logger.error(
                f"vital_l5_{self.source_name}_search_error",
                error=str(e),
            )
            return []
    
    async def get_by_id(
        self,
        item_id: str,
        **kwargs
    ) -> Optional[GeneralResult]:
        """Get item by ID."""
        if self.source == GeneralSource.RAG:
            return await self._get_rag_document(item_id, kwargs.get('tenant_id', ''))
        return None

    async def _execute_impl(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the tool via the standardized L5 interface.

        Maps the execute(params) pattern to the search() method.
        Expected params: {"query": str, "max_results": int, ...}
        """
        query = params.get("query", "")
        max_results = params.get("max_results", 20)

        # Extract additional kwargs
        extra_kwargs = {k: v for k, v in params.items() if k not in ["query", "max_results"]}

        results = await self.search(query, max_results=max_results, **extra_kwargs)

        # Convert results to standardized format
        return {
            "results": [
                {
                    "id": r.id,
                    "title": r.title,
                    "content": r.content,
                    "source": r.source,
                    "score": r.score,
                    "url": r.url,
                    "snippet": r.snippet,
                    "metadata": r.metadata,
                }
                for r in results
            ],
            "total": len(results),
            "source_type": self.source.value,
        }
    
    # ==================== RAG ====================
    async def _search_rag(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[GeneralResult]:
        """Search internal RAG knowledge base."""
        tenant_id = kwargs.get('tenant_id', '')
        document_types = kwargs.get('document_types')
        min_score = kwargs.get('min_score', 0.5)
        
        # Generate embedding
        embedding = await self._embed_query(query)
        if not embedding:
            return []
        
        if self.use_pinecone and self.pinecone:
            return await self._search_pinecone(embedding, tenant_id, max_results, document_types, min_score)
        else:
            return await self._search_pgvector(embedding, tenant_id, max_results, document_types, min_score)
    
    async def _embed_query(self, query: str) -> Optional[List[float]]:
        """Generate embedding for query."""
        if self.embedding_service:
            return await self.embedding_service.embed(query)
        
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI()
            response = await client.embeddings.create(
                model="text-embedding-3-large",
                input=query,
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_embed_failed", error=str(e))
            return None
    
    async def _search_pgvector(
        self,
        embedding: List[float],
        tenant_id: str,
        max_results: int,
        document_types: Optional[List[str]],
        min_score: float,
    ) -> List[GeneralResult]:
        """Search using Supabase pgvector."""
        if not self.supabase:
            return []
        
        try:
            params = {
                'query_embedding': embedding,
                'match_count': max_results,
                'filter_tenant_id': tenant_id,
                'min_similarity': min_score,
            }
            if document_types:
                params['filter_types'] = document_types
            
            result = self.supabase.rpc('match_documents', params).execute()
            
            if not result.data:
                return []
            
            results = []
            for row in result.data:
                results.append(GeneralResult(
                    id=row.get('id', ''),
                    title=row.get('title', ''),
                    content=row.get('content', ''),
                    source=self.source_name,
                    score=float(row.get('similarity', 0)),
                    url=row.get('source', ''),
                    metadata=row.get('metadata', {}),
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_pgvector_failed", error=str(e))
            return []
    
    async def _search_pinecone(
        self,
        embedding: List[float],
        tenant_id: str,
        max_results: int,
        document_types: Optional[List[str]],
        min_score: float,
    ) -> List[GeneralResult]:
        """Search using Pinecone."""
        try:
            from pinecone import Pinecone
            
            pc = Pinecone()
            index = pc.Index(self.pinecone_index)
            
            filter_dict = {'tenant_id': tenant_id}
            if document_types:
                filter_dict['type'] = {'$in': document_types}
            
            response = index.query(
                vector=embedding,
                top_k=max_results,
                filter=filter_dict,
                include_metadata=True,
            )
            
            results = []
            for match in response.matches:
                if match.score >= min_score:
                    metadata = match.metadata or {}
                    results.append(GeneralResult(
                        id=match.id,
                        title=metadata.get('title', ''),
                        content=metadata.get('content', ''),
                        source=self.source_name,
                        score=float(match.score),
                        url=metadata.get('source', ''),
                        metadata=metadata,
                    ))
            
            return results
            
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_pinecone_failed", error=str(e))
            return []
    
    async def _get_rag_document(
        self,
        document_id: str,
        tenant_id: str,
    ) -> Optional[GeneralResult]:
        """Get specific document."""
        if not self.supabase:
            return None
        
        try:
            result = self.supabase.table('documents') \
                .select('*') \
                .eq('id', document_id) \
                .eq('tenant_id', tenant_id) \
                .single() \
                .execute()
            
            if result.data:
                return GeneralResult(
                    id=result.data['id'],
                    title=result.data.get('title', ''),
                    content=result.data.get('content', ''),
                    source=self.source_name,
                    url=result.data.get('source', ''),
                    metadata=result.data.get('metadata', {}),
                )
            return None
            
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_get_document_failed", error=str(e))
            return None
    
    # ==================== Web Search ====================
    async def _search_web(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[GeneralResult]:
        """Search web using available provider."""
        include_domains = kwargs.get('include_domains')
        exclude_domains = kwargs.get('exclude_domains')
        search_depth = kwargs.get('search_depth', 'basic')
        
        # Try providers in order
        if self.tavily_key:
            results = await self._search_tavily(query, max_results, include_domains, exclude_domains, search_depth)
            if results:
                return results
        
        if self.serpapi_key:
            results = await self._search_serpapi(query, max_results)
            if results:
                return results
        
        # Fallback to DuckDuckGo
        return await self._search_duckduckgo(query, max_results)
    
    async def _search_tavily(
        self,
        query: str,
        max_results: int,
        include_domains: Optional[List[str]],
        exclude_domains: Optional[List[str]],
        search_depth: str,
    ) -> List[GeneralResult]:
        """Search using Tavily."""
        payload = {
            'api_key': self.tavily_key,
            'query': query,
            'max_results': max_results,
            'search_depth': search_depth,
        }
        if include_domains:
            payload['include_domains'] = include_domains
        if exclude_domains:
            payload['exclude_domains'] = exclude_domains
        
        data = await self._make_request(
            'POST',
            "https://api.tavily.com/search",
            json_data=payload
        )
        
        if not data:
            return []
        
        results = []
        for item in data.get('results', []):
            results.append(GeneralResult(
                success=True,
                tool_id=self.config.id,
                id=item.get('url', ''),
                title=item.get('title', ''),
                content=item.get('content', ''),
                source=self.source_name,
                score=item.get('score', 0),
                url=item.get('url', ''),
                snippet=item.get('content', ''),
                domain=self._extract_domain(item.get('url', '')),
            ))

        return results

    async def _search_serpapi(
        self,
        query: str,
        max_results: int,
    ) -> List[GeneralResult]:
        """Search using SerpAPI."""
        data = await self._make_request(
            'GET',
            "https://serpapi.com/search",
            params={
                'api_key': self.serpapi_key,
                'q': query,
                'num': max_results,
                'engine': 'google',
            }
        )
        
        if not data:
            return []
        
        results = []
        for i, item in enumerate(data.get('organic_results', [])):
            results.append(GeneralResult(
                success=True,
                tool_id=self.config.id,
                id=item.get('link', ''),
                title=item.get('title', ''),
                content=item.get('snippet', ''),
                source=self.source_name,
                score=1.0 / (i + 1),
                url=item.get('link', ''),
                snippet=item.get('snippet', ''),
                domain=self._extract_domain(item.get('link', '')),
            ))

        return results

    async def _search_duckduckgo(
        self,
        query: str,
        max_results: int,
    ) -> List[GeneralResult]:
        """Search using DuckDuckGo."""
        try:
            from duckduckgo_search import DDGS
            
            with DDGS() as ddgs:
                search_results = list(ddgs.text(query, max_results=max_results))
            
            results = []
            for i, item in enumerate(search_results):
                results.append(GeneralResult(
                    success=True,
                    tool_id=self.config.id,
                    id=item.get('href', ''),
                    title=item.get('title', ''),
                    content=item.get('body', ''),
                    source=self.source_name,
                    score=1.0 / (i + 1),
                    url=item.get('href', ''),
                    snippet=item.get('body', ''),
                    domain=self._extract_domain(item.get('href', '')),
                ))

            return results
            
        except ImportError:
            logger.warning("vital_l5_web_search_duckduckgo_not_installed")
            return []
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_duckduckgo_failed", error=str(e))
            return []
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except:
            return ""
    
    # ==================== World Bank ====================
    async def _search_world_bank(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[GeneralResult]:
        """Search World Bank indicators."""
        countries = kwargs.get('countries')
        start_year = kwargs.get('start_year')
        end_year = kwargs.get('end_year')
        indicator_id = kwargs.get('indicator_id')
        
        if indicator_id:
            return await self._get_indicator_data(indicator_id, countries, start_year, end_year, max_results)
        else:
            return await self._search_indicators(query, max_results)
    
    async def _search_indicators(
        self,
        query: str,
        max_results: int,
    ) -> List[GeneralResult]:
        """Search for World Bank indicators."""
        data = await self._make_request(
            'GET',
            f"{self.base_url}/indicator",
            params={'format': 'json', 'per_page': 500}
        )
        
        if not data or len(data) < 2:
            return []
        
        results = []
        query_lower = query.lower()
        
        for item in data[1]:
            name = item.get('name', '').lower()
            source_note = item.get('sourceNote', '').lower()
            
            if query_lower in name or query_lower in source_note:
                results.append(GeneralResult(
                    success=True,
                    tool_id=self.config.id,
                    id=item.get('id', ''),
                    title=item.get('name', ''),
                    content=item.get('sourceNote', '')[:500],
                    source=self.source_name,
                    url=f"https://data.worldbank.org/indicator/{item.get('id', '')}",
                    indicator=item.get('id', ''),
                    metadata={
                        'source': item.get('source', {}).get('value', ''),
                        'organization': item.get('sourceOrganization', ''),
                    }
                ))
        
        return results[:max_results]
    
    async def _get_indicator_data(
        self,
        indicator_id: str,
        countries: Optional[List[str]],
        start_year: Optional[int],
        end_year: Optional[int],
        max_results: int,
    ) -> List[GeneralResult]:
        """Get data for specific indicator."""
        country_param = ';'.join(countries) if countries else 'all'
        
        params = {'format': 'json', 'per_page': 1000}
        if start_year and end_year:
            params['date'] = f'{start_year}:{end_year}'
        
        data = await self._make_request(
            'GET',
            f"{self.base_url}/country/{country_param}/indicator/{indicator_id}",
            params=params
        )
        
        if not data or len(data) < 2 or not data[1]:
            return []
        
        results = []
        for item in data[1][:max_results]:
            value = item.get('value')
            results.append(GeneralResult(
                success=True,
                tool_id=self.config.id,
                id=f"{item.get('countryiso3code', '')}_{item.get('date', '')}",
                title=item.get('indicator', {}).get('value', ''),
                content=f"{item.get('country', {}).get('value', '')}: {value}",
                source=self.source_name,
                url=f"https://data.worldbank.org/indicator/{indicator_id}",
                country=item.get('country', {}).get('value', ''),
                indicator=indicator_id,
                year=int(item.get('date', 0)),
                value=float(value) if value is not None else None,
            ))

        return results


# ==================== Factory Function ====================
def create_general_tool(
    source: str,
    **kwargs
) -> GeneralL5Tool:
    """
    Factory function to create general tool.
    
    Args:
        source: Source name ('rag', 'web_search', 'world_bank')
        **kwargs: Source-specific configuration
        
    Returns:
        Configured general tool
    
    Examples:
        # RAG
        tool = create_general_tool('rag', supabase_client=supabase)
        results = await tool.search('drug interactions', tenant_id='...')
        
        # Web Search
        tool = create_general_tool('web_search', tavily_key='...')
        results = await tool.search('latest cancer research')
        
        # World Bank
        tool = create_general_tool('world_bank')
        results = await tool.search('health expenditure', indicator_id='SH.XPD.CHEX.GD.ZS')
    """
    try:
        source_enum = GeneralSource(source.lower())
    except ValueError:
        raise ValueError(f"Unknown general source: {source}. Valid: {[s.value for s in GeneralSource]}")
    
    return GeneralL5Tool(source=source_enum, **kwargs)
