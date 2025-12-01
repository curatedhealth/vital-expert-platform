"""
Citation Enrichment Service
Fetches and formats citations from Supabase for RAG results
Supports multiple citation styles: APA, AMA, Chicago, Harvard, Vancouver, ICMJE
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum
import structlog
from functools import lru_cache

logger = structlog.get_logger()


class CitationStyle(str, Enum):
    """Supported citation styles"""
    APA = "apa"           # American Psychological Association
    AMA = "ama"           # American Medical Association
    CHICAGO = "chicago"   # Chicago Manual of Style
    HARVARD = "harvard"   # Harvard referencing
    VANCOUVER = "vancouver"  # Vancouver/ICMJE numbered style
    ICMJE = "icmje"       # International Committee of Medical Journal Editors
    MLA = "mla"           # Modern Language Association

    @classmethod
    def from_string(cls, value: str) -> "CitationStyle":
        """Convert string to CitationStyle, default to APA"""
        try:
            return cls(value.lower())
        except ValueError:
            return cls.APA


class CitationData:
    """Citation data for a document"""

    def __init__(
        self,
        doc_id: str,
        title: str,
        source_name: Optional[str] = None,
        document_type: Optional[str] = None,
        publication_date: Optional[str] = None,
        domain: Optional[str] = None,
        file_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.doc_id = doc_id
        self.title = title
        self.source_name = source_name
        self.document_type = document_type
        self.publication_date = publication_date
        self.domain = domain
        self.file_name = file_name
        self.metadata = metadata or {}

    def format_citation(self, style: CitationStyle = CitationStyle.APA) -> str:
        """
        Format citation according to specified style

        Args:
            style: Citation style (APA, AMA, Chicago, Harvard, Vancouver, ICMJE, MLA)

        Returns:
            Formatted citation string
        """
        # Parse year from publication date
        year = None
        if self.publication_date:
            try:
                year = datetime.fromisoformat(self.publication_date.replace('Z', '+00:00')).year
            except (ValueError, AttributeError):
                pass

        # Extract author from metadata or use source_name
        author = self.metadata.get('author') or self.source_name

        # Route to style-specific formatter
        if style == CitationStyle.APA:
            return self._format_apa(author, year)
        elif style == CitationStyle.AMA:
            return self._format_ama(author, year)
        elif style == CitationStyle.CHICAGO:
            return self._format_chicago(author, year)
        elif style == CitationStyle.HARVARD:
            return self._format_harvard(author, year)
        elif style in (CitationStyle.VANCOUVER, CitationStyle.ICMJE):
            return self._format_vancouver(author, year)
        elif style == CitationStyle.MLA:
            return self._format_mla(author, year)
        else:
            return self._format_apa(author, year)  # Default to APA

    def _format_apa(self, author: Optional[str], year: Optional[int]) -> str:
        """APA style: Author (Year). Title. Source."""
        # Example: FDA. (2023). Guidance on drug development. FDA.
        parts = []
        if author:
            parts.append(f"{author}.")
        if year:
            parts.append(f"({year}).")
        parts.append(f"{self.title}.")
        if self.source_name and self.source_name != author:
            parts.append(f"{self.source_name}.")
        if self.document_type:
            parts.append(f"[{self.document_type}]")
        return " ".join(parts)

    def _format_ama(self, author: Optional[str], year: Optional[int]) -> str:
        """AMA style: Author. Title. Source. Year."""
        # Example: FDA. Guidance on drug development. FDA; 2023.
        parts = []
        if author:
            parts.append(f"{author}.")
        parts.append(f"{self.title}.")
        if self.source_name and self.source_name != author:
            parts.append(f"{self.source_name};")
        if year:
            parts.append(f"{year}.")
        return " ".join(parts)

    def _format_chicago(self, author: Optional[str], year: Optional[int]) -> str:
        """Chicago style: Author. "Title." Source, Year."""
        # Example: FDA. "Guidance on Drug Development." FDA, 2023.
        parts = []
        if author:
            parts.append(f"{author}.")
        parts.append(f'"{self.title}."')
        source_parts = []
        if self.source_name and self.source_name != author:
            source_parts.append(self.source_name)
        if year:
            source_parts.append(str(year))
        if source_parts:
            parts.append(f"{', '.join(source_parts)}.")
        return " ".join(parts)

    def _format_harvard(self, author: Optional[str], year: Optional[int]) -> str:
        """Harvard style: Author (Year) Title, Source."""
        # Example: FDA (2023) Guidance on drug development, FDA.
        parts = []
        if author:
            parts.append(author)
        if year:
            parts.append(f"({year})")
        parts.append(self.title)
        if self.source_name and self.source_name != author:
            parts.append(f", {self.source_name}.")
        else:
            parts.append(".")
        return " ".join(parts)

    def _format_vancouver(self, author: Optional[str], year: Optional[int]) -> str:
        """Vancouver/ICMJE style: Author. Title. Source. Year."""
        # Example: FDA. Guidance on drug development. FDA. 2023.
        parts = []
        if author:
            parts.append(f"{author}.")
        parts.append(f"{self.title}.")
        if self.source_name and self.source_name != author:
            parts.append(f"{self.source_name}.")
        if year:
            parts.append(f"{year}.")
        return " ".join(parts)

    def _format_mla(self, author: Optional[str], year: Optional[int]) -> str:
        """MLA style: Author. Title. Source, Year."""
        # Example: FDA. "Guidance on Drug Development." FDA, 2023.
        parts = []
        if author:
            parts.append(f"{author}.")
        parts.append(f'"{self.title}."')
        source_parts = []
        if self.source_name and self.source_name != author:
            source_parts.append(self.source_name)
        if year:
            source_parts.append(str(year))
        if source_parts:
            parts.append(f"{', '.join(source_parts)}.")
        return " ".join(parts)

    def to_url(self) -> Optional[str]:
        """
        Generate URL/reference for the document
        Returns internal reference path since documents are in Supabase
        """
        # For internal documents, return a reference path
        # This could be enhanced to return actual URLs for external sources
        if self.file_name:
            return f"/knowledge/{self.doc_id}/{self.file_name}"
        return f"/knowledge/{self.doc_id}"


class WebCitationData:
    """Citation data for web sources (search results, scraped pages)"""

    def __init__(
        self,
        url: str,
        title: str,
        site_name: Optional[str] = None,
        published_date: Optional[str] = None,
        access_date: Optional[str] = None,
        author: Optional[str] = None
    ):
        self.url = url
        self.title = title
        self.site_name = site_name or self._extract_site_name(url)
        self.published_date = published_date
        self.access_date = access_date or datetime.now().strftime("%Y-%m-%d")
        self.author = author

    @staticmethod
    def _extract_site_name(url: str) -> str:
        """Extract domain name from URL as site name"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '')
            # Capitalize first letter of each part
            parts = domain.split('.')
            if len(parts) >= 2:
                return parts[-2].capitalize() + '.' + parts[-1]
            return domain.capitalize()
        except Exception:
            return "Web Source"

    def _parse_year(self) -> Optional[int]:
        """Parse year from publication date"""
        if not self.published_date:
            return None
        try:
            # Try ISO format first
            if 'T' in self.published_date or '-' in self.published_date:
                return datetime.fromisoformat(self.published_date.replace('Z', '+00:00')).year
            # Try just year
            return int(self.published_date[:4])
        except (ValueError, AttributeError):
            return None

    def _format_access_date(self, style: CitationStyle) -> str:
        """Format access date according to style"""
        try:
            date = datetime.strptime(self.access_date, "%Y-%m-%d")
            if style in (CitationStyle.APA, CitationStyle.HARVARD):
                return date.strftime("%B %d, %Y")  # January 15, 2024
            elif style == CitationStyle.MLA:
                return date.strftime("%d %b. %Y")  # 15 Jan. 2024
            elif style in (CitationStyle.VANCOUVER, CitationStyle.ICMJE, CitationStyle.AMA):
                return date.strftime("%Y %b %d")  # 2024 Jan 15
            else:
                return date.strftime("%B %d, %Y")
        except Exception:
            return self.access_date

    def format_citation(self, style: CitationStyle = CitationStyle.APA) -> str:
        """
        Format web citation according to specified style

        Args:
            style: Citation style (APA, AMA, Chicago, Harvard, Vancouver, ICMJE, MLA)

        Returns:
            Formatted citation string
        """
        year = self._parse_year()

        if style == CitationStyle.APA:
            return self._format_apa(year)
        elif style == CitationStyle.AMA:
            return self._format_ama(year)
        elif style == CitationStyle.CHICAGO:
            return self._format_chicago(year)
        elif style == CitationStyle.HARVARD:
            return self._format_harvard(year)
        elif style in (CitationStyle.VANCOUVER, CitationStyle.ICMJE):
            return self._format_vancouver(year)
        elif style == CitationStyle.MLA:
            return self._format_mla(year)
        else:
            return self._format_apa(year)

    def _format_apa(self, year: Optional[int]) -> str:
        """APA 7th: Author. (Year, Month Day). Title. Site Name. URL"""
        # Example: FDA. (2024, January 15). Drug safety update. FDA.gov. https://fda.gov/...
        parts = []
        if self.author:
            parts.append(f"{self.author}.")
        elif self.site_name:
            parts.append(f"{self.site_name}.")
        if year:
            parts.append(f"({year}).")
        else:
            parts.append("(n.d.).")
        parts.append(f"{self.title}.")
        if self.site_name and self.author:
            parts.append(f"{self.site_name}.")
        parts.append(f"Retrieved {self._format_access_date(CitationStyle.APA)}, from {self.url}")
        return " ".join(parts)

    def _format_ama(self, year: Optional[int]) -> str:
        """AMA: Author. Title. Site Name. Published date. Accessed date. URL"""
        # Example: FDA. Drug safety update. FDA.gov. Published January 15, 2024. Accessed January 20, 2024. https://fda.gov/...
        parts = []
        if self.author:
            parts.append(f"{self.author}.")
        elif self.site_name:
            parts.append(f"{self.site_name}.")
        parts.append(f"{self.title}.")
        if self.site_name and self.author:
            parts.append(f"{self.site_name}.")
        if year:
            parts.append(f"Published {year}.")
        parts.append(f"Accessed {self._format_access_date(CitationStyle.AMA)}.")
        parts.append(self.url)
        return " ".join(parts)

    def _format_chicago(self, year: Optional[int]) -> str:
        """Chicago: Author. "Title." Site Name. Last modified/Published date. URL."""
        # Example: FDA. "Drug Safety Update." FDA.gov. January 15, 2024. https://fda.gov/...
        parts = []
        if self.author:
            parts.append(f"{self.author}.")
        elif self.site_name:
            parts.append(f"{self.site_name}.")
        parts.append(f'"{self.title}."')
        if self.site_name and self.author:
            parts.append(f"{self.site_name}.")
        if year:
            parts.append(f"{year}.")
        parts.append(self.url)
        return " ".join(parts)

    def _format_harvard(self, year: Optional[int]) -> str:
        """Harvard: Author (Year) Title, Site Name. Available at: URL (Accessed: date)."""
        # Example: FDA (2024) Drug safety update, FDA.gov. Available at: https://fda.gov/... (Accessed: 15 January 2024).
        parts = []
        if self.author:
            parts.append(self.author)
        elif self.site_name:
            parts.append(self.site_name)
        if year:
            parts.append(f"({year})")
        else:
            parts.append("(n.d.)")
        parts.append(f"{self.title},")
        if self.site_name and self.author:
            parts.append(f"{self.site_name}.")
        parts.append(f"Available at: {self.url}")
        parts.append(f"(Accessed: {self._format_access_date(CitationStyle.HARVARD)}).")
        return " ".join(parts)

    def _format_vancouver(self, year: Optional[int]) -> str:
        """Vancouver: Author. Title [Internet]. Site Name; Year [cited date]. Available from: URL"""
        # Example: FDA. Drug safety update [Internet]. FDA.gov; 2024 [cited 2024 Jan 20]. Available from: https://fda.gov/...
        parts = []
        if self.author:
            parts.append(f"{self.author}.")
        elif self.site_name:
            parts.append(f"{self.site_name}.")
        parts.append(f"{self.title} [Internet].")
        if self.site_name and self.author:
            parts.append(f"{self.site_name};")
        if year:
            parts.append(f"{year}")
        parts.append(f"[cited {self._format_access_date(CitationStyle.VANCOUVER)}].")
        parts.append(f"Available from: {self.url}")
        return " ".join(parts)

    def _format_mla(self, year: Optional[int]) -> str:
        """MLA 9th: Author. "Title." Site Name, Day Month Year, URL. Accessed Day Month Year."""
        # Example: FDA. "Drug Safety Update." FDA.gov, 15 Jan. 2024, https://fda.gov/.... Accessed 20 Jan. 2024.
        parts = []
        if self.author:
            parts.append(f"{self.author}.")
        elif self.site_name:
            parts.append(f"{self.site_name}.")
        parts.append(f'"{self.title}."')
        if self.site_name and self.author:
            parts.append(f"{self.site_name},")
        if year:
            parts.append(f"{year},")
        parts.append(f"{self.url}.")
        parts.append(f"Accessed {self._format_access_date(CitationStyle.MLA)}.")
        return " ".join(parts)

    @classmethod
    def from_search_result(cls, result: Dict[str, Any]) -> "WebCitationData":
        """Create WebCitationData from a web search result dict"""
        return cls(
            url=result.get('url', ''),
            title=result.get('title', 'Untitled'),
            published_date=result.get('published_date'),
            author=result.get('author')
        )


def format_web_citations(
    results: List[Dict[str, Any]],
    style: str = "apa"
) -> List[Dict[str, Any]]:
    """
    Add formatted citations to web search results

    Args:
        results: List of web search result dicts
        style: Citation style string (apa, ama, chicago, harvard, vancouver, icmje, mla)

    Returns:
        Results with 'citation' field added
    """
    citation_style = CitationStyle.from_string(style)

    for result in results:
        web_citation = WebCitationData.from_search_result(result)
        result['citation'] = web_citation.format_citation(citation_style)

    return results


class CitationEnricher:
    """
    Enriches RAG results with citation data from Supabase

    Features:
    - Batch fetching for efficiency
    - In-memory caching
    - Formatted citation generation
    - Source attribution
    """

    def __init__(self, supabase_client):
        """
        Initialize with Supabase client

        Args:
            supabase_client: Async Supabase client
        """
        self.supabase = supabase_client
        self._cache: Dict[str, CitationData] = {}
        self._cache_ttl = 3600  # 1 hour cache

    async def enrich_citations(
        self,
        doc_ids: List[str]
    ) -> Dict[str, CitationData]:
        """
        Fetch citation data for multiple documents

        Args:
            doc_ids: List of document IDs from Pinecone results

        Returns:
            Dict mapping doc_id to CitationData
        """
        if not doc_ids:
            return {}

        # Deduplicate
        unique_ids = list(set(doc_ids))

        # Check cache first
        cached = {}
        missing = []
        for doc_id in unique_ids:
            if doc_id in self._cache:
                cached[doc_id] = self._cache[doc_id]
            else:
                missing.append(doc_id)

        # Fetch missing from Supabase
        if missing:
            fetched = await self._fetch_from_supabase(missing)

            # Update cache
            for doc_id, citation in fetched.items():
                self._cache[doc_id] = citation

            cached.update(fetched)

        logger.info(
            "citations_enriched",
            requested=len(doc_ids),
            cached=len(doc_ids) - len(missing),
            fetched=len(missing)
        )

        return cached

    async def _fetch_from_supabase(
        self,
        doc_ids: List[str]
    ) -> Dict[str, CitationData]:
        """
        Fetch citation data from Supabase

        Joins with document_types and source lookup tables
        """
        try:
            # Fetch documents with related data
            # Note: We use the columns available in knowledge_documents
            result = await self.supabase.table('knowledge_documents').select(
                'id, title, domain, publication_date, file_name, metadata, '
                'document_types:document_type_id(name), '
                'document_formats:document_format_id(name)'
            ).in_('id', doc_ids).execute()

            citations = {}
            for doc in result.data:
                doc_id = str(doc['id'])

                # Extract document type name from join
                doc_type = None
                if doc.get('document_types'):
                    doc_type = doc['document_types'].get('name')

                # Extract source from metadata if available
                source_name = None
                metadata = doc.get('metadata') or {}
                if isinstance(metadata, dict):
                    source_name = metadata.get('source_name') or metadata.get('source')

                citation = CitationData(
                    doc_id=doc_id,
                    title=doc.get('title', 'Untitled'),
                    source_name=source_name,
                    document_type=doc_type,
                    publication_date=doc.get('publication_date'),
                    domain=doc.get('domain'),
                    file_name=doc.get('file_name'),
                    metadata=metadata
                )

                citations[doc_id] = citation

            return citations

        except Exception as e:
            logger.error(
                "citation_fetch_failed",
                doc_ids=doc_ids[:5],  # Log first 5 for debugging
                error=str(e)
            )

            # Return empty citations on error (graceful degradation)
            return {doc_id: CitationData(doc_id=doc_id, title="Unknown") for doc_id in doc_ids}

    def clear_cache(self):
        """Clear the citation cache"""
        self._cache.clear()
        logger.info("citation_cache_cleared")


# Singleton instance
_enricher: Optional[CitationEnricher] = None


async def get_citation_enricher(supabase_client=None) -> CitationEnricher:
    """
    Get or create citation enricher singleton

    Args:
        supabase_client: Supabase client (required on first call)

    Returns:
        CitationEnricher instance
    """
    global _enricher

    if _enricher is None:
        if supabase_client is None:
            # Get default client
            from services.database_service import get_supabase_client
            supabase_client = await get_supabase_client()

        _enricher = CitationEnricher(supabase_client)

    return _enricher
