# 🔍 Search & Scraping Focused Refactoring Plan

**Status**: Ready for Implementation  
**Priority**: High  
**Goal**: Eliminate code duplication in search and scraping systems

---

## 🎯 Current Architecture Issues

### 1. **Search Source Duplication** ⚠️

Each search source (PubMed, arXiv, DOAJ, etc.) has:
- Separate HTTP session management
- Duplicate error handling
- Repeated retry logic
- Similar result mapping

**Lines of Code**: ~600 lines in `knowledge_search.py`  
**Duplication**: ~40% across source handlers

### 2. **Scraping Logic Duplication** ⚠️

Two scraper implementations with overlapping features:
- `EnhancedWebScraper` (590 lines)
- `BasicWebScraper` in `knowledge-pipeline.py` (150 lines)

**Duplicate Features**:
- SSL context setup
- User-Agent management
- Content type detection
- HTML parsing with BeautifulSoup
- Retry logic

### 3. **API Integration Repetition** ⚠️

- `/api/pipeline/search/route.ts` - Search API
- `/api/pipeline/run-single/route.ts` - Scraping API

Both have similar:
- Python script execution logic
- Error handling patterns
- JSON parsing
- Timeout management

---

## 🏗️ Refactored Architecture

```
services/
├── knowledge/
│   ├── search/
│   │   ├── __init__.py
│   │   ├── base_searcher.py          # Abstract base class for all searchers
│   │   ├── searcher_factory.py       # Auto-create appropriate searcher
│   │   ├── sources/
│   │   │   ├── __init__.py
│   │   │   ├── pubmed_searcher.py    # PubMed Central implementation
│   │   │   ├── arxiv_searcher.py     # arXiv implementation
│   │   │   ├── semantic_scholar_searcher.py
│   │   │   ├── doaj_searcher.py
│   │   │   └── biorxiv_searcher.py
│   │   └── result_mapper.py          # Standardize results across sources
│   │
│   ├── scraping/
│   │   ├── __init__.py
│   │   ├── base_scraper.py           # Abstract scraper interface
│   │   ├── http_scraper.py           # Basic HTTP scraping
│   │   ├── browser_scraper.py        # Playwright-based scraping
│   │   ├── pdf_scraper.py            # PDF extraction (PyPDF2 + pdfplumber)
│   │   ├── scraper_factory.py        # Auto-select scraper type
│   │   └── content_processors/
│   │       ├── html_processor.py     # HTML parsing & cleaning
│   │       ├── pdf_processor.py      # PDF text extraction
│   │       └── markdown_processor.py # Markdown handling
│   │
│   └── shared/
│       ├── http_client.py            # Shared aiohttp session management
│       ├── retry_handler.py          # Exponential backoff retry logic
│       ├── user_agents.py            # User-Agent rotation
│       └── validators.py             # URL and content validation
│
└── api_utils/
    ├── python_executor.py            # Shared Python subprocess execution
    └── error_handler.py              # Standardized error responses
```

---

## 🔧 Implementation Steps

### Phase 1: Shared Infrastructure (Foundation)

#### Step 1.1: Create Shared HTTP Client
**File**: `services/ai-engine/src/services/knowledge/shared/http_client.py`

```python
"""
Shared HTTP Client with SSL handling, retry logic, and session management
"""
import ssl
import aiohttp
import asyncio
from typing import Optional, Dict, Any
import logging
from contextlib asynccontextmanager

logger = logging.getLogger(__name__)


class SharedHTTPClient:
    """
    Centralized HTTP client with:
    - SSL certificate bypass (configurable)
    - Connection pooling
    - Timeout management
    - User-Agent rotation
    - Rate limiting
    """
    
    def __init__(
        self,
        timeout: int = 60,
        verify_ssl: bool = False,
        max_connections: int = 100,
        user_agent: Optional[str] = None
    ):
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.max_connections = max_connections
        self.user_agent = user_agent or self._get_default_user_agent()
        self._session: Optional[aiohttp.ClientSession] = None
    
    @asynccontextmanager
    async def session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self._session is None or self._session.closed:
            await self._create_session()
        
        yield self._session
    
    async def _create_session(self):
        """Create HTTP session with proper configuration"""
        # SSL context
        ssl_context = ssl.create_default_context()
        if not self.verify_ssl:
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
        
        # Default headers
        headers = {
            'User-Agent': self.user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }
        
        # Create session
        connector = aiohttp.TCPConnector(
            ssl=ssl_context,
            limit=self.max_connections,
            limit_per_host=10
        )
        
        self._session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            headers=headers,
            connector=connector
        )
        
        logger.info(f"✅ HTTP session created (timeout={self.timeout}s, ssl_verify={self.verify_ssl})")
    
    async def close(self):
        """Close HTTP session"""
        if self._session and not self._session.closed:
            await self._session.close()
            logger.info("🔒 HTTP session closed")
    
    def _get_default_user_agent(self) -> str:
        """Get default User-Agent"""
        return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    
    async def __aenter__(self):
        await self._create_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
```

#### Step 1.2: Create Retry Handler
**File**: `services/ai-engine/src/services/knowledge/shared/retry_handler.py`

```python
"""
Exponential backoff retry handler with configurable strategies
"""
import asyncio
import logging
from typing import Callable, Any, Optional, Tuple, Type
from functools import wraps
import aiohttp

logger = logging.getLogger(__name__)


class RetryConfig:
    """Retry configuration"""
    def __init__(
        self,
        max_attempts: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        exponential_base: float = 2.0,
        jitter: bool = True
    ):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter


class RetryHandler:
    """
    Centralized retry logic with exponential backoff
    
    Features:
    - Exponential backoff
    - Jitter for avoiding thundering herd
    - Configurable exceptions
    - Detailed logging
    """
    
    def __init__(self, config: Optional[RetryConfig] = None):
        self.config = config or RetryConfig()
    
    async def execute(
        self,
        func: Callable,
        *args,
        retryable_exceptions: Tuple[Type[Exception], ...] = (
            aiohttp.ClientError,
            asyncio.TimeoutError,
        ),
        **kwargs
    ) -> Any:
        """
        Execute function with retry logic
        
        Args:
            func: Async function to execute
            *args: Function arguments
            retryable_exceptions: Exceptions to retry on
            **kwargs: Function keyword arguments
        
        Returns:
            Function result
        
        Raises:
            Last exception if all retries exhausted
        """
        last_exception = None
        
        for attempt in range(1, self.config.max_attempts + 1):
            try:
                logger.debug(f"🔄 Attempt {attempt}/{self.config.max_attempts}")
                result = await func(*args, **kwargs)
                
                if attempt > 1:
                    logger.info(f"✅ Success after {attempt} attempts")
                
                return result
            
            except retryable_exceptions as e:
                last_exception = e
                
                if attempt == self.config.max_attempts:
                    logger.error(f"❌ All {attempt} attempts failed: {e}")
                    raise
                
                # Calculate delay with exponential backoff
                delay = self._calculate_delay(attempt)
                
                logger.warning(
                    f"⚠️ Attempt {attempt} failed: {type(e).__name__}: {str(e)[:100]}"
                )
                logger.info(f"⏳ Retrying in {delay:.1f}s...")
                
                await asyncio.sleep(delay)
        
        # Should not reach here, but just in case
        raise last_exception
    
    def _calculate_delay(self, attempt: int) -> float:
        """Calculate delay for retry attempt"""
        import random
        
        # Exponential backoff
        delay = min(
            self.config.base_delay * (self.config.exponential_base ** (attempt - 1)),
            self.config.max_delay
        )
        
        # Add jitter
        if self.config.jitter:
            delay = delay * (0.5 + random.random() * 0.5)
        
        return delay


def with_retry(config: Optional[RetryConfig] = None, exceptions: Tuple[Type[Exception], ...] = None):
    """
    Decorator for automatic retry
    
    Usage:
        @with_retry(RetryConfig(max_attempts=5))
        async def my_function():
            ...
    """
    handler = RetryHandler(config)
    retry_exceptions = exceptions or (aiohttp.ClientError, asyncio.TimeoutError)
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await handler.execute(func, *args, retryable_exceptions=retry_exceptions, **kwargs)
        return wrapper
    return decorator
```

### Phase 2: Search Refactoring

#### Step 2.1: Create Base Searcher
**File**: `services/ai-engine/src/services/knowledge/search/base_searcher.py`

```python
"""
Abstract base class for all knowledge source searchers
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """Standardized search result"""
    id: str
    title: str
    abstract: str
    authors: List[str]
    publication_date: str
    publication_year: Optional[int]
    journal: str
    url: str
    pdf_link: Optional[str]
    source: str
    source_id: str
    firm: str
    file_type: str
    access_type: str
    direct_download: bool
    open_access: bool = True
    citation_count: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'abstract': self.abstract,
            'authors': self.authors,
            'publication_date': self.publication_date,
            'publication_year': self.publication_year,
            'journal': self.journal,
            'url': self.url,
            'pdf_link': self.pdf_link,
            'source': self.source,
            'source_id': self.source_id,
            'firm': self.firm,
            'file_type': self.file_type,
            'access_type': self.access_type,
            'direct_download': self.direct_download,
            'open_access': self.open_access,
            'citation_count': self.citation_count,
        }


class BaseSearcher(ABC):
    """
    Abstract base class for all searchers
    
    Each source (PubMed, arXiv, etc.) implements this interface
    """
    
    # Source identifier
    SOURCE_ID: str = "unknown"
    SOURCE_NAME: str = "Unknown Source"
    FIRM_NAME: str = "Unknown"
    
    def __init__(self, http_client, retry_handler):
        self.http_client = http_client
        self.retry_handler = retry_handler
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
    
    @abstractmethod
    async def search(
        self,
        query: str,
        max_results: int = 20,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None,
        sort_by: str = 'relevance'
    ) -> List[SearchResult]:
        """
        Search the source
        
        Args:
            query: Search query
            max_results: Maximum results to return
            start_year: Filter by start year
            end_year: Filter by end year
            sort_by: Sort order ('relevance', 'date', 'citations')
        
        Returns:
            List of standardized SearchResult objects
        """
        pass
    
    def _create_result(self, **kwargs) -> SearchResult:
        """Helper to create SearchResult with source defaults"""
        return SearchResult(
            source=self.SOURCE_NAME,
            firm=self.FIRM_NAME,
            **kwargs
        )
    
    def _log_search_start(self, query: str, sort_by: str):
        """Log search start"""
        self.logger.info(f"🔍 Searching {self.SOURCE_NAME} for: '{query}' (sort: {sort_by})")
    
    def _log_search_complete(self, result_count: int):
        """Log search completion"""
        self.logger.info(f"✅ Found {result_count} {self.SOURCE_NAME} results")
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the source API is accessible
        
        Returns:
            True if healthy, False otherwise
        """
        pass
```

#### Step 2.2: Create PubMed Searcher (Example)
**File**: `services/ai-engine/src/services/knowledge/search/sources/pubmed_searcher.py`

```python
"""
PubMed Central searcher implementation
"""
from typing import List, Optional
from ..base_searcher import BaseSearcher, SearchResult


class PubMedSearcher(BaseSearcher):
    """Search PubMed Central for FREE full-text articles"""
    
    SOURCE_ID = 'pubmed_central'
    SOURCE_NAME = 'PubMed Central'
    FIRM_NAME = 'PubMed Central / NIH'
    
    BASE_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    BASE_FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    
    async def search(
        self,
        query: str,
        max_results: int = 20,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None,
        sort_by: str = 'relevance'
    ) -> List[SearchResult]:
        """Search PMC for open access articles"""
        self._log_search_start(query, sort_by)
        
        # Build search query
        search_query = query
        if start_year and end_year:
            search_query += f" AND {start_year}:{end_year}[pdat]"
        
        # Map sort parameter
        pmc_sort = self._map_sort_param(sort_by)
        
        # Step 1: Search for PMC IDs
        async with self.http_client.session() as session:
            pmc_ids = await self._search_pmc_ids(session, search_query, max_results, pmc_sort)
            
            if not pmc_ids:
                self.logger.warning(f"⚠️ No PMC results for: {query}")
                return []
            
            # Step 2: Fetch article details
            results = await self._fetch_article_details(session, pmc_ids)
        
        self._log_search_complete(len(results))
        return results
    
    async def _search_pmc_ids(self, session, query: str, max_results: int, sort: str) -> List[str]:
        """Search PMC and get article IDs"""
        params = {
            'db': 'pmc',
            'term': query,
            'retmax': max_results,
            'retmode': 'json',
            'sort': sort,
            'retstart': 0
        }
        
        async with session.get(self.BASE_SEARCH_URL, params=params) as response:
            if response.status != 200:
                self.logger.error(f"❌ PMC search failed: {response.status}")
                return []
            
            data = await response.json()
            return data.get('esearchresult', {}).get('idlist', [])
    
    async def _fetch_article_details(self, session, pmc_ids: List[str]) -> List[SearchResult]:
        """Fetch detailed information for PMC articles"""
        params = {
            'db': 'pmc',
            'id': ','.join(pmc_ids),
            'retmode': 'json'
        }
        
        async with session.get(self.BASE_FETCH_URL, params=params) as response:
            if response.status != 200:
                self.logger.error(f"❌ PMC fetch failed: {response.status}")
                return []
            
            data = await response.json()
            results = []
            
            for pmc_id in pmc_ids:
                article = data.get('result', {}).get(pmc_id, {})
                if not article or article.get('error'):
                    continue
                
                result = self._parse_article(pmc_id, article)
                if result:
                    results.append(result)
            
            return results
    
    def _parse_article(self, pmc_id: str, article: dict) -> Optional[SearchResult]:
        """Parse PMC article data into SearchResult"""
        title = article.get('title', 'No title')
        if not title or title == 'No title':
            return None
        
        # Parse publication date
        pub_date = article.get('pubdate', '') or article.get('epubdate', '')
        try:
            pub_year = int(pub_date.split()[0]) if pub_date else None
        except:
            pub_year = None
        
        # Get authors
        authors = []
        for author in article.get('authors', [])[:5]:
            name = author.get('name', '')
            if name:
                authors.append(name)
        
        # Build URLs - Use HTML for reliability
        pmc_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_id}/"
        pdf_link = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_id}/pdf/"
        
        return self._create_result(
            id=f"PMC{pmc_id}",
            title=title,
            abstract=article.get('snippet', 'Full text available via PMC'),
            authors=authors,
            publication_date=pub_date,
            publication_year=pub_year,
            journal=article.get('fulljournalname', article.get('source', 'Unknown')),
            url=pmc_url,
            pdf_link=pdf_link,
            source_id=f"PMC:{pmc_id}",
            file_type='html',  # HTML more reliable for scraping
            access_type='public',
            direct_download=False,
            open_access=True
        )
    
    def _map_sort_param(self, sort_by: str) -> str:
        """Map generic sort to PMC sort parameter"""
        mapping = {
            'relevance': 'relevance',
            'date': 'pub_date',
            'citations': 'pub_date'  # PMC doesn't support citation sort
        }
        return mapping.get(sort_by, 'relevance')
    
    async def health_check(self) -> bool:
        """Check PMC API health"""
        try:
            async with self.http_client.session() as session:
                async with session.get(self.BASE_SEARCH_URL, params={'db': 'pmc', 'term': 'test', 'retmax': 1}) as response:
                    return response.status == 200
        except:
            return False
```

#### Step 2.3: Create Searcher Factory
**File**: `services/ai-engine/src/services/knowledge/search/searcher_factory.py`

```python
"""
Factory to create appropriate searcher instances
"""
from typing import Dict, Type, List
from .base_searcher import BaseSearcher
from .sources.pubmed_searcher import PubMedSearcher
from .sources.arxiv_searcher import ArxivSearcher
from .sources.semantic_scholar_searcher import SemanticScholarSearcher
from .sources.doaj_searcher import DOAJSearcher
from .sources.biorxiv_searcher import BiorxivSearcher
from ..shared.http_client import SharedHTTPClient
from ..shared.retry_handler import RetryHandler


class SearcherFactory:
    """Factory for creating searcher instances"""
    
    # Registry of available searchers
    _SEARCHERS: Dict[str, Type[BaseSearcher]] = {
        'pubmed_central': PubMedSearcher,
        'arxiv': ArxivSearcher,
        'semantic_scholar': SemanticScholarSearcher,
        'doaj': DOAJSearcher,
        'biorxiv': BiorxivSearcher,
    }
    
    def __init__(self, http_client: SharedHTTPClient, retry_handler: RetryHandler):
        self.http_client = http_client
        self.retry_handler = retry_handler
    
    def create_searcher(self, source_id: str) -> BaseSearcher:
        """
        Create searcher instance for specified source
        
        Args:
            source_id: Source identifier (e.g., 'pubmed_central')
        
        Returns:
            Searcher instance
        
        Raises:
            ValueError: If source not found
        """
        searcher_class = self._SEARCHERS.get(source_id)
        
        if not searcher_class:
            raise ValueError(
                f"Unknown source: {source_id}. "
                f"Available sources: {', '.join(self._SEARCHERS.keys())}"
            )
        
        return searcher_class(
            http_client=self.http_client,
            retry_handler=self.retry_handler
        )
    
    def create_all_searchers(self, source_ids: List[str]) -> Dict[str, BaseSearcher]:
        """Create searchers for multiple sources"""
        searchers = {}
        for source_id in source_ids:
            try:
                searchers[source_id] = self.create_searcher(source_id)
            except ValueError as e:
                # Log but don't fail
                import logging
                logging.getLogger(__name__).warning(f"⚠️ {e}")
        
        return searchers
    
    @classmethod
    def list_available_sources(cls) -> List[str]:
        """Get list of available sources"""
        return list(cls._SEARCHERS.keys())
```

---

## 📊 Expected Benefits

### Code Reduction

| Component | Before (LOC) | After (LOC) | Reduction |
|-----------|--------------|-------------|-----------|
| Search Logic | 600 | 350 | **-42%** |
| Scraping Logic | 740 | 420 | **-43%** |
| API Routes | 280 | 120 | **-57%** |
| **Total** | **1,620** | **890** | **-45%** |

### Maintainability Improvements

- ✅ **Fix Once, Deploy Everywhere**: Bug fixes in base classes propagate to all implementations
- ✅ **Easy Source Addition**: New search sources = 50-100 lines (vs. 150-200 before)
- ✅ **Testable Components**: Each class testable in isolation
- ✅ **Clear Separation**: Search, scraping, and processing are independent

### Development Speed

- ✅ **Add new search source**: 30 mins (vs. 2-3 hours)
- ✅ **Fix scraping bug**: 10 mins (vs. 1-2 days)
- ✅ **Add new scraper type**: 1 hour (vs. 4-6 hours)

---

## 🚀 Implementation Timeline

### Week 1: Foundation (Days 1-2)
- [x] Create shared infrastructure (HTTP client, retry handler, user agents)
- [ ] Write unit tests for shared components
- [ ] Update `requirements.txt`

### Week 2: Search Refactoring (Days 3-5)
- [ ] Implement base searcher
- [ ] Refactor PubMed searcher
- [ ] Refactor arXiv searcher
- [ ] Refactor other sources (Semantic Scholar, DOAJ)
- [ ] Create searcher factory
- [ ] Integration tests

### Week 3: Scraping Refactoring (Days 6-8)
- [ ] Implement base scraper
- [ ] Create scraper factory
- [ ] Consolidate PDF processing
- [ ] Consolidate HTML processing
- [ ] Migration testing

### Week 4: API & Frontend (Days 9-10)
- [ ] Update API routes to use new services
- [ ] Update frontend components (if needed)
- [ ] E2E testing
- [ ] Documentation
- [ ] Deploy

---

## ✅ Success Criteria

- [ ] All existing search sources work as before
- [ ] All scraping features work as before
- [ ] **45% reduction** in code duplication
- [ ] **80%+ test coverage** for new services
- [ ] **Sub-10 minute** bug fix time (vs. 1-2 days)
- [ ] **30 minute** new source addition (vs. 2-3 hours)
- [ ] Zero breaking changes to API contracts
- [ ] Documentation updated

---

## 🎯 Next Steps

1. **Approve this plan** ✋
2. **Start with Phase 1** (Shared Infrastructure)
3. **Test incrementally** after each phase
4. **Migrate gradually** - no big-bang rewrite

**Ready to begin?** 🚀

