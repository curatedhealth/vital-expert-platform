"""
Knowledge Source Search Module
Searches PUBLIC, FREE, DOWNLOADABLE academic sources only

Supported Sources:
- PubMed Central (PMC): Free full-text medical research with PDFs
- arXiv: 100% free preprints in physics, CS, math, etc. with PDFs
- bioRxiv: Free biology preprints with PDFs
- DOAJ: Directory of Open Access Journals with PDFs
- Semantic Scholar: Free academic search with some PDFs

Note: Only returns results with publicly accessible full-text content
"""

import aiohttp
import asyncio
from typing import List, Dict, Optional, Literal
from datetime import datetime
import logging
from urllib.parse import quote_plus
import xml.etree.ElementTree as ET
import json

logger = logging.getLogger(__name__)

SearchSource = Literal['pubmed_central', 'arxiv', 'biorxiv', 'doaj', 'semantic_scholar']

class KnowledgeSearcher:
    """Search multiple knowledge sources"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'VITAL-AI Knowledge Search Bot/1.0'},
            connector=aiohttp.TCPConnector(ssl=ssl_context)
        )
        return self
        
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    async def search(
        self,
        query: str,
        source: SearchSource,
        max_results: int = 20,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> List[Dict]:
        """
        Search a specific source (PUBLIC ACCESS ONLY)
        
        Args:
            query: Search query
            source: Source to search
            max_results: Maximum number of results
            start_year: Filter by start year
            end_year: Filter by end year
            
        Returns:
            List of search results with metadata (only free, downloadable content)
        """
        logger.info(f"🔍 Searching {source} for: {query} (public access only)")
        
        if source == 'pubmed_central':
            return await self._search_pubmed_central(query, max_results, start_year, end_year)
        elif source == 'arxiv':
            return await self._search_arxiv(query, max_results)
        elif source == 'biorxiv':
            return await self._search_biorxiv(query, max_results)
        elif source == 'doaj':
            return await self._search_doaj(query, max_results)
        elif source == 'semantic_scholar':
            return await self._search_semantic_scholar(query, max_results)
        else:
            logger.warning(f"⚠️ Unsupported source: {source}")
            return []
    
    async def _search_pubmed_central(
        self,
        query: str,
        max_results: int,
        start_year: Optional[int],
        end_year: Optional[int]
    ) -> List[Dict]:
        """Search PubMed Central for FREE FULL-TEXT articles only"""
        try:
            # Build query with date filters and free full-text requirement
            search_query = f"{query} AND free fulltext[filter]"
            if start_year and end_year:
                search_query += f" AND {start_year}:{end_year}[pdat]"
            
            # Step 1: Search PMC for IDs (use PMC database for free full-text)
            search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            search_params = {
                'db': 'pmc',  # PubMed Central database (free full-text)
                'term': search_query,
                'retmax': max_results,
                'retmode': 'json',
                'sort': 'relevance'
            }
            
            async with self.session.get(search_url, params=search_params) as response:
                if response.status != 200:
                    logger.error(f"❌ PMC search failed: {response.status}")
                    return []
                    
                data = await response.json()
                id_list = data.get('esearchresult', {}).get('idlist', [])
                
            if not id_list:
                return []
            
            # Step 2: Fetch details for each PMC ID
            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
            fetch_params = {
                'db': 'pmc',
                'id': ','.join(id_list),
                'retmode': 'json'
            }
            
            async with self.session.get(fetch_url, params=fetch_params) as response:
                if response.status != 200:
                    return []
                    
                data = await response.json()
                results = []
                
                for pmc_id in id_list:
                    article = data.get('result', {}).get(pmc_id, {})
                    if not article:
                        continue
                    
                    # Parse publication date
                    pub_date = article.get('pubdate', '')
                    try:
                        pub_year = int(pub_date.split()[0]) if pub_date else None
                    except:
                        pub_year = None
                    
                    # Get authors
                    authors = []
                    for author in article.get('authors', [])[:5]:
                        authors.append(author.get('name', ''))
                    
                    # Build PDF link (PMC provides free PDFs)
                    pdf_link = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_id}/pdf/"
                    
                    results.append({
                        'id': f"PMC{pmc_id}",
                        'title': article.get('title', ''),
                        'abstract': 'Full text available via PMC',
                        'authors': authors,
                        'publication_date': pub_date,
                        'publication_year': pub_year,
                        'journal': article.get('fulljournalname', article.get('source', '')),
                        'url': f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_id}/",
                        'pdf_link': pdf_link,
                        'source': 'PubMed Central',
                        'source_id': f"PMC:{pmc_id}",
                        'firm': 'PubMed Central / NIH',
                        'file_type': 'pdf',
                        'access_type': 'public',
                        'direct_download': True,
                        'open_access': True
                    })
                
                logger.info(f"✅ Found {len(results)} PMC free full-text results")
                return results
                
        except Exception as e:
            logger.error(f"❌ PMC search error: {e}")
            return []
    
    async def _search_arxiv(self, query: str, max_results: int) -> List[Dict]:
        """Search arXiv"""
        try:
            # arXiv API
            url = "http://export.arxiv.org/api/query"
            params = {
                'search_query': f'all:{query}',
                'start': 0,
                'max_results': max_results,
                'sortBy': 'relevance',
                'sortOrder': 'descending'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error(f"❌ arXiv search failed: {response.status}")
                    return []
                
                xml_text = await response.text()
                
            # Parse XML response
            root = ET.fromstring(xml_text)
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            
            results = []
            for entry in root.findall('atom:entry', ns):
                # Extract data
                title = entry.find('atom:title', ns).text.strip().replace('\n', ' ')
                summary = entry.find('atom:summary', ns).text.strip().replace('\n', ' ')
                
                # Get ID and PDF link
                arxiv_id = entry.find('atom:id', ns).text.split('/abs/')[-1]
                pdf_link = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                
                # Get authors
                authors = []
                for author in entry.findall('atom:author', ns)[:5]:
                    name = author.find('atom:name', ns)
                    if name is not None:
                        authors.append(name.text)
                
                # Get publication date
                published = entry.find('atom:published', ns).text[:10]  # YYYY-MM-DD
                try:
                    pub_year = int(published.split('-')[0])
                except:
                    pub_year = None
                
                # Get category
                category = entry.find('atom:category', ns)
                category_name = category.get('term') if category is not None else 'Unknown'
                
                results.append({
                    'id': arxiv_id,
                    'title': title,
                    'abstract': summary,
                    'authors': authors,
                    'publication_date': published,
                    'publication_year': pub_year,
                    'journal': f'arXiv ({category_name})',
                    'url': f"https://arxiv.org/abs/{arxiv_id}",
                    'pdf_link': pdf_link,
                    'source': 'arXiv',
                    'source_id': f"arXiv:{arxiv_id}",
                    'firm': 'arXiv / Cornell University',
                    'file_type': 'pdf',
                    'access_type': 'public',
                    'direct_download': True
                })
            
            logger.info(f"✅ Found {len(results)} arXiv results")
            return results
            
        except Exception as e:
            logger.error(f"❌ arXiv search error: {e}")
            return []
    
    async def _search_biorxiv(self, query: str, max_results: int) -> List[Dict]:
        """Search bioRxiv for FREE biology preprints with PDFs"""
        try:
            logger.info("🔬 Searching bioRxiv...")
            
            # bioRxiv search API
            search_url = "https://api.biorxiv.org/details/biorxiv"
            
            # Note: bioRxiv API is limited - we'll construct URL for latest papers
            # For a full implementation, you'd need to use their bulk data endpoint
            # This is a simplified version
            
            results = []
            logger.info("⚠️ bioRxiv integration pending - returning empty results")
            # TODO: Implement bioRxiv API when ready
            
            return results
            
        except Exception as e:
            logger.error(f"❌ bioRxiv search error: {e}")
            return []
    
    async def _search_doaj(self, query: str, max_results: int) -> List[Dict]:
        """Search DOAJ (Directory of Open Access Journals)"""
        try:
            logger.info("📚 Searching DOAJ...")
            
            # DOAJ API
            search_url = "https://doaj.org/api/search/articles/" + quote_plus(query)
            params = {
                'pageSize': max_results,
                'page': 1
            }
            
            async with self.session.get(search_url, params=params) as response:
                if response.status != 200:
                    logger.error(f"❌ DOAJ search failed: {response.status}")
                    return []
                
                data = await response.json()
                results = []
                
                for article in data.get('results', []):
                    bibjson = article.get('bibjson', {})
                    
                    # Get title and abstract
                    title = bibjson.get('title', 'No title')
                    abstract = bibjson.get('abstract', 'No abstract available')
                    
                    # Get authors
                    authors = []
                    for author in bibjson.get('author', [])[:5]:
                        name = author.get('name', '')
                        if name:
                            authors.append(name)
                    
                    # Get publication info
                    pub_year = bibjson.get('year')
                    journal = bibjson.get('journal', {}).get('title', 'Unknown')
                    
                    # Get link (DOAJ provides article URL)
                    links = bibjson.get('link', [])
                    url = None
                    pdf_link = None
                    
                    for link in links:
                        link_url = link.get('url', '')
                        link_type = link.get('type', '')
                        
                        if 'fulltext' in link_type.lower() or 'pdf' in link_url.lower():
                            pdf_link = link_url
                        if not url:
                            url = link_url
                    
                    if not url:
                        continue
                    
                    results.append({
                        'id': article.get('id', ''),
                        'title': title,
                        'abstract': abstract,
                        'authors': authors,
                        'publication_date': f"{pub_year}-01-01" if pub_year else '',
                        'publication_year': pub_year,
                        'journal': journal,
                        'url': url,
                        'pdf_link': pdf_link,
                        'source': 'DOAJ',
                        'source_id': f"DOAJ:{article.get('id', '')}",
                        'firm': 'Directory of Open Access Journals',
                        'file_type': 'pdf' if pdf_link else 'html',
                        'access_type': 'public',
                        'direct_download': bool(pdf_link),
                        'open_access': True
                    })
                
                logger.info(f"✅ Found {len(results)} DOAJ open access results")
                return results
                
        except Exception as e:
            logger.error(f"❌ DOAJ search error: {e}")
            return []
    
    async def _search_semantic_scholar(self, query: str, max_results: int) -> List[Dict]:
        """Search Semantic Scholar for academic papers"""
        try:
            logger.info("🧠 Searching Semantic Scholar...")
            
            # Semantic Scholar API
            search_url = "https://api.semanticscholar.org/graph/v1/paper/search"
            params = {
                'query': query,
                'limit': max_results,
                'fields': 'title,abstract,authors,year,openAccessPdf,url,citationCount,venue'
            }
            
            async with self.session.get(search_url, params=params) as response:
                if response.status != 200:
                    logger.error(f"❌ Semantic Scholar search failed: {response.status}")
                    return []
                
                data = await response.json()
                results = []
                
                for paper in data.get('data', []):
                    # Only include papers with open access PDFs
                    pdf_info = paper.get('openAccessPdf')
                    if not pdf_info or not pdf_info.get('url'):
                        continue  # Skip papers without free PDFs
                    
                    # Get authors
                    authors = []
                    for author in paper.get('authors', [])[:5]:
                        authors.append(author.get('name', ''))
                    
                    results.append({
                        'id': paper.get('paperId', ''),
                        'title': paper.get('title', ''),
                        'abstract': paper.get('abstract', 'No abstract available'),
                        'authors': authors,
                        'publication_date': f"{paper.get('year', '')}-01-01",
                        'publication_year': paper.get('year'),
                        'journal': paper.get('venue', 'Unknown'),
                        'url': paper.get('url', ''),
                        'pdf_link': pdf_info.get('url'),
                        'source': 'Semantic Scholar',
                        'source_id': f"S2:{paper.get('paperId', '')}",
                        'firm': 'Semantic Scholar / AI2',
                        'file_type': 'pdf',
                        'access_type': 'public',
                        'direct_download': True,
                        'open_access': True,
                        'citation_count': paper.get('citationCount', 0)
                    })
                
                logger.info(f"✅ Found {len(results)} Semantic Scholar open access results")
                return results
                
        except Exception as e:
            logger.error(f"❌ Semantic Scholar search error: {e}")
            return []


async def search_knowledge_sources(
    query: str,
    sources: List[SearchSource],
    max_results_per_source: int = 20
) -> Dict[str, List[Dict]]:
    """
    Search multiple sources concurrently
    
    Args:
        query: Search query
        sources: List of sources to search
        max_results_per_source: Max results per source
        
    Returns:
        Dictionary mapping source name to results
    """
    async with KnowledgeSearcher() as searcher:
        tasks = []
        for source in sources:
            tasks.append(searcher.search(query, source, max_results_per_source))
        
        results_list = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Build results dictionary
        results = {}
        for source, source_results in zip(sources, results_list):
            if isinstance(source_results, Exception):
                logger.error(f"❌ Error searching {source}: {source_results}")
                results[source] = []
            else:
                results[source] = source_results
        
        total = sum(len(r) for r in results.values())
        logger.info(f"✅ Search complete: {total} total results across {len(sources)} sources")
        
        return results


if __name__ == '__main__':
    # Test search (PUBLIC ACCESS ONLY)
    async def test():
        results = await search_knowledge_sources(
            query='artificial intelligence healthcare',
            sources=['pubmed_central', 'arxiv', 'semantic_scholar'],
            max_results_per_source=5
        )
        
        for source, items in results.items():
            print(f"\n=== {source.upper()} ({len(items)} results) ===")
            for item in items[:3]:
                print(f"  ✓ {item['title']}")
                if item.get('pdf_link'):
                    print(f"    📄 PDF: {item['pdf_link']}")
                print(f"    🔗 {item['url']}")
    
    asyncio.run(test())

