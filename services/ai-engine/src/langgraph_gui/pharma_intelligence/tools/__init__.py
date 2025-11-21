"""
Tools for accessing pharmaceutical data sources.

This module provides interfaces to various data sources:
- PubMed: Biomedical literature
- arXiv: Research preprints
- ClinicalTrials: Clinical trial data
- FDA: Regulatory data
- Scraper: News and updates via RSS
- WebSearch: General web search
"""

from .pubmed import PubMedSearchTool
from .arxiv import ArXivSearchTool
from .clinical_trials import ClinicalTrialsSearchTool
from .fda import FDASearchTool
from .scraper import ScraperTool
from .web_search import WebSearchTool

__all__ = [
    'PubMedSearchTool',
    'ArXivSearchTool',
    'ClinicalTrialsSearchTool',
    'FDASearchTool',
    'ScraperTool',
    'WebSearchTool',
]

