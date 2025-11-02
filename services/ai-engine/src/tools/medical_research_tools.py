"""
Medical and Research Tools for AI Agents
Implements PubMed, arXiv, WHO, ClinicalTrials, FDA, and other research tools
"""

import aiohttp
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog
from xml.etree import ElementTree as ET
import json

logger = structlog.get_logger()


class MedicalResearchTools:
    """Collection of medical and research tools"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def pubmed_search(
        self,
        query: str,
        max_results: int = 10,
        sort: str = "relevance"
    ) -> Dict[str, Any]:
        """
        Search PubMed for medical literature.
        
        Args:
            query: Search query
            max_results: Maximum number of results (1-100)
            sort: Sort order (relevance, date)
            
        Returns:
            Dict with articles list and metadata
        """
        start_time = datetime.now()
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            # Step 1: Search PubMed to get PMIDs
            search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            search_params = {
                "db": "pubmed",
                "term": query,
                "retmax": min(max_results, 100),
                "retmode": "json",
                "sort": "relevance" if sort == "relevance" else "pub_date"
            }
            
            async with self.session.get(search_url, params=search_params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                search_data = await response.json()
            
            pmids = search_data.get("esearchresult", {}).get("idlist", [])
            
            if not pmids:
                return {
                    "articles": [],
                    "total_results": 0,
                    "query": query,
                    "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
                }
            
            # Step 2: Fetch article details
            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
            fetch_params = {
                "db": "pubmed",
                "id": ",".join(pmids),
                "retmode": "json"
            }
            
            async with self.session.get(fetch_url, params=fetch_params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                fetch_data = await response.json()
            
            # Parse articles
            articles = []
            result_data = fetch_data.get("result", {})
            
            for pmid in pmids:
                if pmid in result_data:
                    article_data = result_data[pmid]
                    articles.append({
                        "pmid": pmid,
                        "title": article_data.get("title", ""),
                        "authors": [author.get("name", "") for author in article_data.get("authors", [])],
                        "journal": article_data.get("fulljournalname", ""),
                        "publication_date": article_data.get("pubdate", ""),
                        "doi": article_data.get("elocationid", ""),
                        "abstract": article_data.get("abstract", ""),  # May be empty
                        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                        "source": "PubMed"
                    })
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.info(
                "✅ PubMed search completed",
                query=query[:50],
                results=len(articles),
                time_ms=processing_time
            )
            
            return {
                "articles": articles,
                "total_results": int(search_data.get("esearchresult", {}).get("count", 0)),
                "query": query,
                "processing_time_ms": processing_time
            }
            
        except Exception as e:
            logger.error("❌ PubMed search failed", query=query, error=str(e))
            return {
                "articles": [],
                "total_results": 0,
                "query": query,
                "error": str(e),
                "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
            }
    
    async def arxiv_search(
        self,
        query: str,
        max_results: int = 10,
        sort_by: str = "relevance"
    ) -> Dict[str, Any]:
        """
        Search arXiv for scientific papers.
        
        Args:
            query: Search query
            max_results: Maximum number of results (1-100)
            sort_by: Sort order (relevance, lastUpdatedDate, submittedDate)
            
        Returns:
            Dict with papers list and metadata
        """
        start_time = datetime.now()
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            # arXiv API endpoint
            base_url = "http://export.arxiv.org/api/query"
            params = {
                "search_query": f"all:{query}",
                "start": 0,
                "max_results": min(max_results, 100),
                "sortBy": sort_by,
                "sortOrder": "descending"
            }
            
            async with self.session.get(base_url, params=params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                xml_data = await response.text()
            
            # Parse XML
            root = ET.fromstring(xml_data)
            namespace = {"atom": "http://www.w3.org/2005/Atom"}
            
            papers = []
            for entry in root.findall("atom:entry", namespace):
                paper_id = entry.find("atom:id", namespace).text if entry.find("atom:id", namespace) is not None else ""
                arxiv_id = paper_id.split("/abs/")[-1] if paper_id else ""
                
                authors = []
                for author in entry.findall("atom:author", namespace):
                    name = author.find("atom:name", namespace)
                    if name is not None:
                        authors.append(name.text)
                
                categories = []
                for category in entry.findall("atom:category", namespace):
                    term = category.get("term")
                    if term:
                        categories.append(term)
                
                papers.append({
                    "arxiv_id": arxiv_id,
                    "title": entry.find("atom:title", namespace).text if entry.find("atom:title", namespace) is not None else "",
                    "authors": authors,
                    "summary": entry.find("atom:summary", namespace).text if entry.find("atom:summary", namespace) is not None else "",
                    "published": entry.find("atom:published", namespace).text if entry.find("atom:published", namespace) is not None else "",
                    "updated": entry.find("atom:updated", namespace).text if entry.find("atom:updated", namespace) is not None else "",
                    "categories": categories,
                    "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}.pdf",
                    "abs_url": f"https://arxiv.org/abs/{arxiv_id}",
                    "source": "arXiv"
                })
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.info(
                "✅ arXiv search completed",
                query=query[:50],
                results=len(papers),
                time_ms=processing_time
            )
            
            return {
                "papers": papers,
                "total_results": len(papers),
                "query": query,
                "processing_time_ms": processing_time
            }
            
        except Exception as e:
            logger.error("❌ arXiv search failed", query=query, error=str(e))
            return {
                "papers": [],
                "total_results": 0,
                "query": query,
                "error": str(e),
                "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
            }
    
    async def clinicaltrials_search(
        self,
        query: str,
        max_results: int = 10,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search ClinicalTrials.gov for clinical trials.
        
        Args:
            query: Search query
            max_results: Maximum number of results (1-100)
            status: Trial status filter (recruiting, active, completed, etc.)
            
        Returns:
            Dict with trials list and metadata
        """
        start_time = datetime.now()
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            # ClinicalTrials.gov API v2
            base_url = "https://clinicaltrials.gov/api/v2/studies"
            params = {
                "query.term": query,
                "pageSize": min(max_results, 100),
                "format": "json"
            }
            
            if status:
                params["filter.overallStatus"] = status
            
            async with self.session.get(base_url, params=params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                data = await response.json()
            
            trials = []
            studies = data.get("studies", [])
            
            for study in studies:
                protocol = study.get("protocolSection", {})
                identification = protocol.get("identificationModule", {})
                status_module = protocol.get("statusModule", {})
                description = protocol.get("descriptionModule", {})
                conditions = protocol.get("conditionsModule", {})
                
                trials.append({
                    "nct_id": identification.get("nctId", ""),
                    "title": identification.get("officialTitle", identification.get("briefTitle", "")),
                    "status": status_module.get("overallStatus", ""),
                    "phase": protocol.get("designModule", {}).get("phases", []),
                    "conditions": conditions.get("conditions", []),
                    "brief_summary": description.get("briefSummary", ""),
                    "start_date": status_module.get("startDateStruct", {}).get("date", ""),
                    "completion_date": status_module.get("completionDateStruct", {}).get("date", ""),
                    "url": f"https://clinicaltrials.gov/study/{identification.get('nctId', '')}",
                    "source": "ClinicalTrials.gov"
                })
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.info(
                "✅ ClinicalTrials search completed",
                query=query[:50],
                results=len(trials),
                time_ms=processing_time
            )
            
            return {
                "trials": trials,
                "total_results": data.get("totalCount", len(trials)),
                "query": query,
                "processing_time_ms": processing_time
            }
            
        except Exception as e:
            logger.error("❌ ClinicalTrials search failed", query=query, error=str(e))
            return {
                "trials": [],
                "total_results": 0,
                "query": query,
                "error": str(e),
                "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
            }
    
    async def fda_drugs_search(
        self,
        query: str,
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Search FDA drug database.
        
        Args:
            query: Search query (drug name, active ingredient, etc.)
            max_results: Maximum number of results (1-100)
            
        Returns:
            Dict with drugs list and metadata
        """
        start_time = datetime.now()
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            # FDA OpenFDA API - Drug Labels
            base_url = "https://api.fda.gov/drug/label.json"
            params = {
                "search": query,
                "limit": min(max_results, 100)
            }
            
            async with self.session.get(base_url, params=params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                data = await response.json()
            
            drugs = []
            results = data.get("results", [])
            
            for result in results:
                drugs.append({
                    "brand_name": result.get("openfda", {}).get("brand_name", [""])[0],
                    "generic_name": result.get("openfda", {}).get("generic_name", [""])[0],
                    "manufacturer": result.get("openfda", {}).get("manufacturer_name", [""])[0],
                    "product_type": result.get("openfda", {}).get("product_type", [""])[0],
                    "route": result.get("openfda", {}).get("route", []),
                    "substance_name": result.get("openfda", {}).get("substance_name", []),
                    "indications_and_usage": result.get("indications_and_usage", [""])[0] if isinstance(result.get("indications_and_usage"), list) else result.get("indications_and_usage", ""),
                    "warnings": result.get("warnings", [""])[0] if isinstance(result.get("warnings"), list) else result.get("warnings", ""),
                    "adverse_reactions": result.get("adverse_reactions", [""])[0] if isinstance(result.get("adverse_reactions"), list) else result.get("adverse_reactions", ""),
                    "source": "FDA OpenFDA"
                })
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.info(
                "✅ FDA drugs search completed",
                query=query[:50],
                results=len(drugs),
                time_ms=processing_time
            )
            
            return {
                "drugs": drugs,
                "total_results": data.get("meta", {}).get("results", {}).get("total", len(drugs)),
                "query": query,
                "processing_time_ms": processing_time
            }
            
        except Exception as e:
            logger.error("❌ FDA drugs search failed", query=query, error=str(e))
            return {
                "drugs": [],
                "total_results": 0,
                "query": query,
                "error": str(e),
                "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
            }
    
    async def who_guidelines_search(
        self,
        query: str,
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Search WHO guidelines and publications.
        
        Note: WHO doesn't have a public API, so this is a simplified mock.
        In production, this would scrape WHO IRIS or use a custom index.
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            Dict with guidelines list and metadata
        """
        start_time = datetime.now()
        
        logger.warning("⚠️ WHO guidelines search is currently a mock implementation")
        
        # Mock response (in production, implement WHO IRIS scraping or custom index)
        guidelines = [
            {
                "title": f"WHO Guideline on {query}",
                "description": "This is a mock WHO guideline result. Implement WHO IRIS integration for real data.",
                "publication_date": "2024",
                "url": "https://www.who.int/publications",
                "source": "WHO (Mock)"
            }
        ]
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "guidelines": guidelines,
            "total_results": 1,
            "query": query,
            "mock": True,
            "processing_time_ms": processing_time
        }


# Standalone async functions for LangGraph integration

async def pubmed_search(query: str, max_results: int = 10) -> Dict[str, Any]:
    """Standalone PubMed search for LangGraph tools"""
    async with MedicalResearchTools() as tools:
        return await tools.pubmed_search(query, max_results)


async def arxiv_search(query: str, max_results: int = 10) -> Dict[str, Any]:
    """Standalone arXiv search for LangGraph tools"""
    async with MedicalResearchTools() as tools:
        return await tools.arxiv_search(query, max_results)


async def clinicaltrials_search(query: str, max_results: int = 10, status: Optional[str] = None) -> Dict[str, Any]:
    """Standalone ClinicalTrials search for LangGraph tools"""
    async with MedicalResearchTools() as tools:
        return await tools.clinicaltrials_search(query, max_results, status)


async def fda_drugs_search(query: str, max_results: int = 10) -> Dict[str, Any]:
    """Standalone FDA drugs search for LangGraph tools"""
    async with MedicalResearchTools() as tools:
        return await tools.fda_drugs_search(query, max_results)


async def who_guidelines_search(query: str, max_results: int = 10) -> Dict[str, Any]:
    """Standalone WHO guidelines search for LangGraph tools"""
    async with MedicalResearchTools() as tools:
        return await tools.who_guidelines_search(query, max_results)


# Calculator tool

async def calculator(expression: str) -> Dict[str, Any]:
    """
    Safe calculator for mathematical expressions.
    
    Args:
        expression: Math expression to evaluate
        
    Returns:
        Dict with result and metadata
    """
    start_time = datetime.now()
    
    try:
        # Safe evaluation (no exec or eval for security)
        # Only allow basic math operations
        import ast
        import operator
        
        # Allowed operations
        operators = {
            ast.Add: operator.add,
            ast.Sub: operator.sub,
            ast.Mult: operator.mul,
            ast.Div: operator.truediv,
            ast.Pow: operator.pow,
            ast.USub: operator.neg,
        }
        
        def eval_expr(node):
            if isinstance(node, ast.Num):
                return node.n
            elif isinstance(node, ast.BinOp):
                return operators[type(node.op)](eval_expr(node.left), eval_expr(node.right))
            elif isinstance(node, ast.UnaryOp):
                return operators[type(node.op)](eval_expr(node.operand))
            else:
                raise ValueError(f"Unsupported operation: {type(node)}")
        
        tree = ast.parse(expression, mode='eval')
        result = eval_expr(tree.body)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        logger.info("✅ Calculator executed", expression=expression, result=result)
        
        return {
            "result": result,
            "expression": expression,
            "processing_time_ms": processing_time
        }
        
    except Exception as e:
        logger.error("❌ Calculator failed", expression=expression, error=str(e))
        return {
            "result": None,
            "expression": expression,
            "error": str(e),
            "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
        }

