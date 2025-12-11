"""
VITAL Path AI Services - VITAL L5 Academic Tools

Unified academic/research data source tools.
Single file handles: PubMed, ArXiv, OpenAlex, Google Scholar.

Naming Convention:
- Class: AcademicL5Tool
- Factory: create_academic_tool(source)
- Logs: vital_l5_{source}_{action}
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import structlog
import xml.etree.ElementTree as ET

from .l5_base import L5BaseTool, ToolConfig, ToolTier, L5Result

logger = structlog.get_logger()


class AcademicSource(Enum):
    """Academic data sources."""
    PUBMED = "pubmed"
    ARXIV = "arxiv"
    OPENALEX = "openalex"
    GOOGLE_SCHOLAR = "google_scholar"


# Source configurations
ACADEMIC_SOURCE_CONFIG = {
    AcademicSource.PUBMED: {
        "base_url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
        "cache_ttl": 24,
        "requires_key": False,  # Key optional but increases rate limit
    },
    AcademicSource.ARXIV: {
        "base_url": "http://export.arxiv.org/api/query",
        "cache_ttl": 6,
        "requires_key": False,
    },
    AcademicSource.OPENALEX: {
        "base_url": "https://api.openalex.org",
        "cache_ttl": 24,
        "requires_key": False,
    },
    AcademicSource.GOOGLE_SCHOLAR: {
        "base_url": "https://serpapi.com/search",
        "cache_ttl": 12,
        "requires_key": True,  # SerpAPI key
    },
}


@dataclass
class AcademicResult(L5Result):
    """Extended result for academic data."""
    authors: List[str] = field(default_factory=list)
    journal: str = ""
    publication_date: str = ""
    doi: Optional[str] = None
    pmid: Optional[str] = None
    arxiv_id: Optional[str] = None
    cited_by_count: int = 0
    abstract: str = ""
    keywords: List[str] = field(default_factory=list)
    is_open_access: bool = False
    pdf_url: Optional[str] = None


class AcademicL5Tool(L5BaseTool[AcademicResult]):
    """
    Unified academic data source tool.

    Supports multiple academic databases via source parameter.
    """

    def __init__(
        self,
        source: AcademicSource,
        api_key: Optional[str] = None,
        email: Optional[str] = None,  # For polite pool access
        **kwargs
    ):
        source_config = ACADEMIC_SOURCE_CONFIG[source]

        # Create ToolConfig for base class
        tool_config = ToolConfig(
            id=f"L5-{source.value.upper()}",
            name=f"Academic {source.value.title()} Tool",
            slug=source.value,
            description=f"Academic {source.value} search tool",
            category="academic",
            tier=1,
            base_url=source_config.get("base_url", ""),
            cache_ttl=source_config.get("cache_ttl", 24) * 3600,
        )

        super().__init__(config=tool_config)

        self.source = source
        self.source_config = source_config
        self.source_name = source.value
        self.api_key = api_key
        self.email = email
        self.base_url = source_config.get("base_url", "")

        # Source-specific handlers
        self._search_handlers = {
            AcademicSource.PUBMED: self._search_pubmed,
            AcademicSource.ARXIV: self._search_arxiv,
            AcademicSource.OPENALEX: self._search_openalex,
            AcademicSource.GOOGLE_SCHOLAR: self._search_google_scholar,
        }

    async def _execute_impl(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the tool via the standardized L5 interface.
        Maps the execute(params) pattern to the search() method.
        """
        query = params.get("query", "")
        max_results = params.get("max_results", 20)
        extra_kwargs = {k: v for k, v in params.items() if k not in ["query", "max_results"]}

        results = await self.search(query, max_results=max_results, **extra_kwargs)

        return {
            "results": [
                {
                    "id": r.id,
                    "title": r.title,
                    "content": r.content,
                    "source": r.source,
                    "url": r.url,
                    "authors": r.authors,
                    "journal": r.journal,
                    "publication_date": r.publication_date,
                    "doi": r.doi,
                    "pmid": r.pmid,
                    "arxiv_id": r.arxiv_id,
                    "cited_by_count": r.cited_by_count,
                    "abstract": r.abstract,
                    "is_open_access": r.is_open_access,
                    "pdf_url": r.pdf_url,
                }
                for r in results
            ],
            "total": len(results),
            "source_type": self.source.value,
        }

    async def _make_request(
        self,
        method: str,
        url: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
    ) -> Optional[Dict[str, Any]]:
        """Make HTTP request using httpx client."""
        try:
            if method.upper() == "GET":
                response = await self.client.get(url, params=params)
            elif method.upper() == "POST":
                response = await self.client.post(url, json=json_data)
            else:
                return None

            response.raise_for_status()

            # Check if response is XML
            content_type = response.headers.get("content-type", "")
            if "xml" in content_type or response.text.strip().startswith("<?xml"):
                return {"_xml": response.text}

            return response.json()
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
    ) -> List[AcademicResult]:
        """Search academic data source."""
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
    ) -> Optional[AcademicResult]:
        """Get item by ID."""
        if self.source == AcademicSource.PUBMED:
            return await self._get_pubmed_by_pmid(item_id)
        elif self.source == AcademicSource.ARXIV:
            return await self._get_arxiv_by_id(item_id)
        elif self.source == AcademicSource.OPENALEX:
            return await self._get_openalex_by_id(item_id)
        return None
    
    # ==================== PubMed ====================
    async def _search_pubmed(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[AcademicResult]:
        """Search PubMed via NCBI E-utilities."""
        # Step 1: ESearch to get PMIDs
        params = {
            'db': 'pubmed',
            'term': query,
            'retmax': max_results,
            'retmode': 'json',
            'sort': kwargs.get('sort', 'relevance'),
        }
        if self.api_key:
            params['api_key'] = self.api_key
        if self.email:
            params['email'] = self.email
        
        search_data = await self._make_request(
            'GET',
            f"{self.base_url}/esearch.fcgi",
            params=params
        )
        
        if not search_data:
            return []
        
        pmids = search_data.get('esearchresult', {}).get('idlist', [])
        if not pmids:
            return []
        
        # Step 2: EFetch to get details
        fetch_params = {
            'db': 'pubmed',
            'id': ','.join(pmids),
            'retmode': 'xml',
        }
        if self.api_key:
            fetch_params['api_key'] = self.api_key
        
        fetch_data = await self._make_request(
            'GET',
            f"{self.base_url}/efetch.fcgi",
            params=fetch_params
        )
        
        if not fetch_data or '_xml' not in fetch_data:
            return []
        
        return self._parse_pubmed_xml(fetch_data['_xml'])
    
    async def _get_pubmed_by_pmid(self, pmid: str) -> Optional[AcademicResult]:
        """Get PubMed article by PMID."""
        results = await self._search_pubmed(pmid, 1)
        return results[0] if results else None
    
    def _parse_pubmed_xml(self, xml_content: str) -> List[AcademicResult]:
        """Parse PubMed XML response."""
        results = []
        
        try:
            root = ET.fromstring(xml_content)
            
            for article_elem in root.findall('.//PubmedArticle'):
                medline = article_elem.find('.//MedlineCitation')
                if medline is None:
                    continue
                
                pmid = medline.findtext('.//PMID', '')
                article = medline.find('.//Article')
                if article is None:
                    continue
                
                # Authors
                authors = []
                for author in article.findall('.//Author'):
                    last = author.findtext('LastName', '')
                    first = author.findtext('ForeName', '')
                    if last:
                        authors.append(f"{last} {first}".strip())
                
                # Publication date
                pub_date = article.find('.//PubDate')
                pub_date_str = ""
                if pub_date is not None:
                    year = pub_date.findtext('Year', '')
                    month = pub_date.findtext('Month', '')
                    pub_date_str = f"{year}-{month}".strip('-')
                
                # DOI
                doi = None
                for id_elem in article_elem.findall('.//ArticleId'):
                    if id_elem.get('IdType') == 'doi':
                        doi = id_elem.text
                        break
                
                results.append(AcademicResult(
                    id=pmid,
                    title=article.findtext('.//ArticleTitle', ''),
                    content=article.findtext('.//Abstract/AbstractText', ''),
                    source=self.source_name,
                    url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    authors=authors[:10],
                    journal=article.findtext('.//Journal/Title', ''),
                    publication_date=pub_date_str,
                    doi=doi,
                    pmid=pmid,
                    abstract=article.findtext('.//Abstract/AbstractText', ''),
                ))
                
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_parse_failed", error=str(e))
        
        return results
    
    # ==================== ArXiv ====================
    async def _search_arxiv(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[AcademicResult]:
        """Search ArXiv."""
        categories = kwargs.get('categories', [])
        
        search_query = f'all:{query}'
        if categories:
            cat_query = ' OR '.join([f'cat:{c}' for c in categories])
            search_query += f' AND ({cat_query})'
        
        data = await self._make_request(
            'GET',
            self.base_url,
            params={
                'search_query': search_query,
                'max_results': max_results,
                'sortBy': kwargs.get('sort_by', 'relevance'),
                'sortOrder': 'descending',
            }
        )
        
        if not data or '_xml' not in data:
            return []
        
        return self._parse_arxiv_xml(data['_xml'])
    
    async def _get_arxiv_by_id(self, arxiv_id: str) -> Optional[AcademicResult]:
        """Get ArXiv paper by ID."""
        data = await self._make_request(
            'GET',
            self.base_url,
            params={'id_list': arxiv_id}
        )
        if data and '_xml' in data:
            results = self._parse_arxiv_xml(data['_xml'])
            return results[0] if results else None
        return None
    
    def _parse_arxiv_xml(self, xml_content: str) -> List[AcademicResult]:
        """Parse ArXiv Atom feed."""
        results = []
        namespaces = {
            'atom': 'http://www.w3.org/2005/Atom',
            'arxiv': 'http://arxiv.org/schemas/atom',
        }
        
        try:
            root = ET.fromstring(xml_content)
            
            for entry in root.findall('atom:entry', namespaces):
                id_elem = entry.find('atom:id', namespaces)
                arxiv_id = id_elem.text.split('/abs/')[-1] if id_elem is not None else ''
                
                # Authors
                authors = []
                for author in entry.findall('atom:author', namespaces):
                    name = author.find('atom:name', namespaces)
                    if name is not None and name.text:
                        authors.append(name.text)
                
                # Links
                pdf_url = ''
                for link in entry.findall('atom:link', namespaces):
                    if link.get('title') == 'pdf':
                        pdf_url = link.get('href', '')
                        break
                
                # DOI
                doi = None
                doi_elem = entry.find('arxiv:doi', namespaces)
                if doi_elem is not None:
                    doi = doi_elem.text
                
                results.append(AcademicResult(
                    id=arxiv_id,
                    title=entry.findtext('atom:title', '', namespaces).strip(),
                    content=entry.findtext('atom:summary', '', namespaces).strip(),
                    source=self.source_name,
                    url=f"https://arxiv.org/abs/{arxiv_id}",
                    authors=authors[:10],
                    publication_date=entry.findtext('atom:published', '', namespaces),
                    doi=doi,
                    arxiv_id=arxiv_id,
                    abstract=entry.findtext('atom:summary', '', namespaces).strip(),
                    pdf_url=pdf_url,
                ))
                
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_parse_failed", error=str(e))
        
        return results
    
    # ==================== OpenAlex ====================
    async def _search_openalex(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[AcademicResult]:
        """Search OpenAlex."""
        params = {
            'search': query,
            'per-page': min(max_results, 100),
            'sort': kwargs.get('sort', 'relevance_score'),
        }
        
        if self.email:
            params['mailto'] = self.email
        
        if kwargs.get('open_access_only'):
            params['filter'] = 'is_oa:true'
        
        data = await self._make_request(
            'GET',
            f"{self.base_url}/works",
            params=params
        )
        
        if not data or 'results' not in data:
            return []
        
        results = []
        for item in data['results']:
            # Authors
            authors = []
            for authorship in item.get('authorships', []):
                author = authorship.get('author', {})
                if author.get('display_name'):
                    authors.append(author['display_name'])
            
            # Venue
            venue = ''
            source = item.get('primary_location', {}).get('source') or {}
            if source:
                venue = source.get('display_name', '')
            
            # Open access URL
            oa_url = None
            best_oa = item.get('best_oa_location', {})
            if best_oa:
                oa_url = best_oa.get('pdf_url') or best_oa.get('landing_page_url')
            
            results.append(AcademicResult(
                id=item.get('id', ''),
                title=item.get('title', ''),
                content=item.get('abstract', '') or '',
                source=self.source_name,
                url=item.get('id', ''),
                authors=authors[:10],
                journal=venue,
                publication_date=item.get('publication_date', ''),
                doi=item.get('doi'),
                cited_by_count=item.get('cited_by_count', 0),
                abstract=item.get('abstract', '') or '',
                is_open_access=item.get('open_access', {}).get('is_oa', False),
                pdf_url=oa_url,
            ))
        
        return results
    
    async def _get_openalex_by_id(self, work_id: str) -> Optional[AcademicResult]:
        """Get OpenAlex work by ID or DOI."""
        if work_id.startswith('10.'):
            work_id = f"https://doi.org/{work_id}"
        
        data = await self._make_request(
            'GET',
            f"{self.base_url}/works/{work_id}",
            params={'mailto': self.email} if self.email else {}
        )
        
        if not data:
            return None
        
        # Reuse search result parsing
        results = await self._search_openalex(work_id, 1)
        return results[0] if results else None
    
    # ==================== Google Scholar ====================
    async def _search_google_scholar(
        self,
        query: str,
        max_results: int,
        **kwargs
    ) -> List[AcademicResult]:
        """Search Google Scholar via SerpAPI."""
        if not self.api_key:
            logger.warning("vital_l5_google_scholar_no_api_key")
            # Try scholarly library fallback
            return await self._search_scholarly_fallback(query, max_results)
        
        params = {
            'engine': 'google_scholar',
            'q': query,
            'api_key': self.api_key,
            'num': min(max_results, 20),
        }
        
        if kwargs.get('year_from'):
            params['as_ylo'] = kwargs['year_from']
        if kwargs.get('year_to'):
            params['as_yhi'] = kwargs['year_to']
        
        data = await self._make_request('GET', self.base_url, params=params)
        
        if not data:
            return []
        
        results = []
        for item in data.get('organic_results', []):
            pub_info = item.get('publication_info', {})
            
            # Extract year
            year = None
            summary = pub_info.get('summary', '')
            import re
            year_match = re.search(r'\b(19|20)\d{2}\b', summary)
            if year_match:
                year = year_match.group()
            
            results.append(AcademicResult(
                id=item.get('result_id', ''),
                title=item.get('title', ''),
                content=item.get('snippet', ''),
                source=self.source_name,
                url=item.get('link', ''),
                authors=pub_info.get('authors', []),
                journal=summary,
                publication_date=year or '',
                cited_by_count=item.get('inline_links', {}).get('cited_by', {}).get('total', 0),
                abstract=item.get('snippet', ''),
                pdf_url=item.get('resources', [{}])[0].get('link') if item.get('resources') else None,
            ))
        
        return results
    
    async def _search_scholarly_fallback(
        self,
        query: str,
        max_results: int,
    ) -> List[AcademicResult]:
        """Fallback to scholarly library (free, rate limited)."""
        try:
            from scholarly import scholarly
            import asyncio
            
            def search_sync():
                search_query = scholarly.search_pubs(query)
                results = []
                for i, pub in enumerate(search_query):
                    if i >= max_results:
                        break
                    
                    bib = pub.get('bib', {})
                    results.append(AcademicResult(
                        id=pub.get('author_pub_id', ''),
                        title=bib.get('title', ''),
                        content=bib.get('abstract', ''),
                        source=self.source_name,
                        url=pub.get('pub_url', ''),
                        authors=bib.get('author', '').split(' and ') if bib.get('author') else [],
                        journal=bib.get('venue', ''),
                        publication_date=str(bib.get('pub_year', '')),
                        cited_by_count=pub.get('num_citations', 0),
                        abstract=bib.get('abstract', ''),
                    ))
                return results
            
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, search_sync)
            
        except ImportError:
            logger.warning("vital_l5_google_scholar_scholarly_not_installed")
            return []
        except Exception as e:
            logger.error(f"vital_l5_{self.source_name}_scholarly_failed", error=str(e))
            return []


# ==================== Factory Function ====================
def create_academic_tool(
    source: str,
    api_key: Optional[str] = None,
    email: Optional[str] = None,
    **kwargs
) -> AcademicL5Tool:
    """
    Factory function to create academic tool.
    
    Args:
        source: Source name (e.g., 'pubmed', 'arxiv', 'openalex')
        api_key: API key if required
        email: Contact email for polite pool access
        **kwargs: Additional configuration
        
    Returns:
        Configured academic tool
    
    Example:
        tool = create_academic_tool('pubmed', email='user@example.com')
        results = await tool.search('cancer immunotherapy')
    """
    try:
        source_enum = AcademicSource(source.lower())
    except ValueError:
        raise ValueError(f"Unknown academic source: {source}. Valid: {[s.value for s in AcademicSource]}")
    
    return AcademicL5Tool(
        source=source_enum,
        api_key=api_key,
        email=email,
        **kwargs
    )
