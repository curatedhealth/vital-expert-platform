"""
VITAL Path AI Services - VITAL L5 Literature Tools

Literature & Research tools: PubMed, Cochrane, ClinicalTrials.gov
3 tools for medical literature search and clinical trial data.

Architecture Pattern:
- PostgreSQL `tools` table: Tool configs (endpoints, handlers, metadata)
- .env file: API credentials (NCBI_API_KEY, COCHRANE_API_KEY)
- Python: Tool execution logic (API calls, parsing)

Flow:
1. ToolLoader fetches tool config from PostgreSQL by l5_id
2. LiteratureL5Tool uses DB config (or fallback hardcoded config)
3. Credentials loaded from environment variables
4. Execute tool with real API calls

Naming Convention:
- Class: LiteratureL5Tool
- Factory: create_literature_tool(tool_key)
"""

from typing import Dict, Any, List, Optional, Union
import xml.etree.ElementTree as ET
import os
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


# ============================================================================
# TOOL CONFIGURATIONS
# ============================================================================

LITERATURE_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "pubmed": ToolConfig(
        id="L5-PM",
        name="PubMed/MEDLINE",
        slug="pubmed-medline",
        description="Biomedical literature from NCBI PubMed database",
        category="literature_research",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.REST_API,
        base_url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
        auth_type=AuthType.API_KEY,
        auth_env_var="NCBI_API_KEY",
        rate_limit=10,
        cost_per_call=0.001,
        cache_ttl=3600,
        tags=["research_database", "literature", "pubmed", "medline", "ncbi"],
        vendor="NLM",
        license="Free (API key recommended)",
        documentation_url="https://www.ncbi.nlm.nih.gov/books/NBK25500/",
    ),
    
    "cochrane": ToolConfig(
        id="L5-COCHRANE",
        name="Cochrane Library",
        slug="cochrane-library",
        description="Systematic reviews and meta-analyses from Cochrane",
        category="literature_research",
        tier=1,
        priority="high",
        adapter_type=AdapterType.REST_API,
        base_url="https://www.cochranelibrary.com/api",
        auth_type=AuthType.API_KEY,
        auth_env_var="COCHRANE_API_KEY",
        rate_limit=5,
        cost_per_call=0.005,
        cache_ttl=86400,
        tags=["systematic_review", "meta_analysis", "evidence_based_medicine", "cochrane"],
        vendor="Cochrane Collaboration",
        license="Subscription required",
        documentation_url="https://www.cochranelibrary.com/",
    ),
    
    "clinicaltrials": ToolConfig(
        id="L5-CT",
        name="ClinicalTrials.gov",
        slug="clinicaltrials-gov",
        description="Clinical trial registry from ClinicalTrials.gov API v2",
        category="literature_research",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.REST_API,
        base_url="https://clinicaltrials.gov/api/v2",
        auth_type=AuthType.NONE,
        rate_limit=20,
        cost_per_call=0.001,
        cache_ttl=3600,
        tags=["clinical_trials", "research", "fda", "nct"],
        vendor="NLM/FDA",
        license="Free",
        documentation_url="https://clinicaltrials.gov/data-api/api",
    ),
}


# ============================================================================
# LITERATURE TOOL CLASS
# ============================================================================

class LiteratureL5Tool(L5BaseTool):
    """
    L5 Tool class for Literature & Research sources.
    Handles PubMed, Cochrane, and ClinicalTrials.gov.
    """
    
    def __init__(self, tool_key: str):
        if tool_key not in LITERATURE_TOOL_CONFIGS:
            raise ValueError(f"Unknown literature tool: {tool_key}. Available: {list(LITERATURE_TOOL_CONFIGS.keys())}")
        
        config = LITERATURE_TOOL_CONFIGS[tool_key]
        super().__init__(config)
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        """Route to appropriate handler based on tool_key."""
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    # ========================================================================
    # PUBMED
    # ========================================================================
    
    async def _execute_pubmed(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search PubMed via NCBI E-utilities.
        
        Params:
            query: str - Search query
            max_results: int - Maximum results (default: 20)
            sort: str - Sort order (relevance, date)
            article_types: List[str] - Filter by article type
        """
        query = params.get("query", "")
        max_results = params.get("max_results", 20)
        sort = params.get("sort", "relevance")
        article_types = params.get("article_types", [])
        
        # Build search query
        search_query = query
        if article_types:
            type_filter = " OR ".join([f'"{t}"[pt]' for t in article_types])
            search_query += f" AND ({type_filter})"
        
        # Step 1: ESearch to get PMIDs
        import os
        search_params = {
            'db': 'pubmed',
            'term': search_query,
            'retmax': max_results,
            'retmode': 'json',
            'sort': sort,
        }
        if os.getenv("NCBI_API_KEY"):
            search_params['api_key'] = os.getenv("NCBI_API_KEY")
        
        search_data = await self._get(
            f"{self.config.base_url}/esearch.fcgi",
            params=search_params
        )
        
        pmids = search_data.get('esearchresult', {}).get('idlist', [])
        if not pmids:
            return {"articles": [], "total": 0}
        
        # Step 2: EFetch to get article details
        fetch_params = {
            'db': 'pubmed',
            'id': ','.join(pmids),
            'retmode': 'xml',
        }
        if os.getenv("NCBI_API_KEY"):
            fetch_params['api_key'] = os.getenv("NCBI_API_KEY")
        
        xml_content = await self._get_xml(
            f"{self.config.base_url}/efetch.fcgi",
            params=fetch_params
        )
        
        articles = self._parse_pubmed_xml(xml_content)
        
        return {
            "articles": articles,
            "total": len(articles),
            "query": query,
        }
    
    def _parse_pubmed_xml(self, xml_content: str) -> List[Dict[str, Any]]:
        """Parse PubMed XML response."""
        articles = []
        
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
                
                # MeSH terms
                mesh_terms = [
                    mesh.text for mesh in medline.findall('.//MeshHeading/DescriptorName')
                    if mesh.text
                ]
                
                # DOI
                doi = None
                for id_elem in article_elem.findall('.//ArticleId'):
                    if id_elem.get('IdType') == 'doi':
                        doi = id_elem.text
                        break
                
                # Publication date
                pub_date = article.find('.//PubDate')
                pub_date_str = ""
                if pub_date is not None:
                    year = pub_date.findtext('Year', '')
                    month = pub_date.findtext('Month', '')
                    pub_date_str = f"{year}-{month}".strip('-')
                
                articles.append({
                    'pmid': pmid,
                    'title': article.findtext('.//ArticleTitle', ''),
                    'abstract': article.findtext('.//Abstract/AbstractText', ''),
                    'authors': authors[:10],
                    'journal': article.findtext('.//Journal/Title', ''),
                    'publication_date': pub_date_str,
                    'doi': doi,
                    'mesh_terms': mesh_terms[:20],
                    'url': f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                })
                
        except Exception as e:
            logger.error(f"vital_l5_pubmed_parse_failed", error=str(e))
        
        return articles
    
    # ========================================================================
    # COCHRANE
    # ========================================================================
    
    async def _execute_cochrane(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search Cochrane Library.
        
        Params:
            query: str - Search query
            max_results: int - Maximum results
            review_type: str - systematic_review, protocol, etc.
        """
        query = params.get("query", "")
        max_results = params.get("max_results", 20)
        review_type = params.get("review_type", "systematic_review")
        
        import os
        if not os.getenv("COCHRANE_API_KEY"):
            # Return mock/limited response without API key
            return {
                "reviews": [],
                "total": 0,
                "note": "Cochrane API key required for full access",
            }
        
        # Cochrane API call
        try:
            data = await self._get(
                f"{self.config.base_url}/search",
                params={
                    'q': query,
                    'limit': max_results,
                    'type': review_type,
                },
                headers={'X-API-Key': os.getenv("COCHRANE_API_KEY")}
            )
            
            reviews = []
            for item in data.get('results', []):
                reviews.append({
                    'id': item.get('id', ''),
                    'title': item.get('title', ''),
                    'authors': item.get('authors', []),
                    'abstract': item.get('abstract', ''),
                    'doi': item.get('doi'),
                    'publication_date': item.get('publicationDate'),
                    'url': item.get('url', ''),
                })
            
            return {
                "reviews": reviews,
                "total": data.get('totalResults', len(reviews)),
            }
            
        except Exception as e:
            logger.error(f"vital_l5_cochrane_failed", error=str(e))
            return {"reviews": [], "total": 0, "error": str(e)}
    
    # ========================================================================
    # CLINICALTRIALS.GOV
    # ========================================================================
    
    async def _execute_clinicaltrials(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search ClinicalTrials.gov API v2.
        
        Params:
            query: str - Search query
            condition: str - Condition/disease
            intervention: str - Drug/treatment
            status: List[str] - Trial status filter
            phase: List[str] - Phase filter
            max_results: int - Maximum results
        """
        query = params.get("query", "")
        condition = params.get("condition")
        intervention = params.get("intervention")
        status = params.get("status", [])
        phase = params.get("phase", [])
        max_results = params.get("max_results", 20)
        
        # Build query params
        api_params = {
            'format': 'json',
            'pageSize': max_results,
        }
        
        if query:
            api_params['query.term'] = query
        if condition:
            api_params['query.cond'] = condition
        if intervention:
            api_params['query.intr'] = intervention
        if status:
            api_params['filter.overallStatus'] = ','.join(status)
        if phase:
            api_params['filter.phase'] = ','.join(phase)
        
        data = await self._get(
            f"{self.config.base_url}/studies",
            params=api_params
        )
        
        trials = []
        for study in data.get('studies', []):
            protocol = study.get('protocolSection', {})
            id_module = protocol.get('identificationModule', {})
            status_module = protocol.get('statusModule', {})
            design_module = protocol.get('designModule', {})
            desc_module = protocol.get('descriptionModule', {})
            conditions_module = protocol.get('conditionsModule', {})
            arms_module = protocol.get('armsInterventionsModule', {})
            
            nct_id = id_module.get('nctId', '')
            
            # Extract interventions
            interventions = []
            for arm in arms_module.get('interventions', []):
                interventions.append({
                    'type': arm.get('type', ''),
                    'name': arm.get('name', ''),
                })
            
            trials.append({
                'nct_id': nct_id,
                'title': id_module.get('officialTitle', id_module.get('briefTitle', '')),
                'brief_summary': desc_module.get('briefSummary', ''),
                'status': status_module.get('overallStatus', ''),
                'phase': design_module.get('phases', []),
                'conditions': conditions_module.get('conditions', []),
                'interventions': interventions[:5],
                'start_date': status_module.get('startDateStruct', {}).get('date'),
                'completion_date': status_module.get('completionDateStruct', {}).get('date'),
                'enrollment': design_module.get('enrollmentInfo', {}).get('count'),
                'url': f"https://clinicaltrials.gov/study/{nct_id}",
            })
        
        return {
            "trials": trials,
            "total": data.get('totalCount', len(trials)),
        }


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_literature_tool(tool_key: str) -> LiteratureL5Tool:
    """Factory function to create literature tools."""
    return LiteratureL5Tool(tool_key)


LITERATURE_TOOL_KEYS = list(LITERATURE_TOOL_CONFIGS.keys())
