"""
FDASearchTool - Tool for accessing pharmaceutical data sources.
"""

"""
Enhanced Tools for Specialized Agents
Includes scraper as a tool alongside search tools
All tools are production-ready with real API implementations
"""

from typing import List, Dict
import requests
from Bio import Entrez
import urllib.request
import urllib.parse
from xml.etree.ElementTree import fromstring
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime
import time
import sys
import os

# Import real, production-ready tools from the same package
from .pubmed import PubMedSearchTool
from .web_search import WebSearchTool
from .arxiv import ArXivSearchTool
from .clinical_trials import ClinicalTrialsSearchTool

class FDASearchTool:
    """
    Search FDA databases for drug approvals and guidance
    """
    
    def __init__(self):
        self.base_url = "https://api.fda.gov/drug/drugsfda.json"
    
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search FDA drug database"""
        results = []
        
        try:
            params = {
                'search': f'openfda.brand_name:"{query}" openfda.generic_name:"{query}"',
                'limit': max_results
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                for item in data.get('results', []):
                    # Extract approval info
                    submissions = item.get('submissions', [])
                    latest_submission = submissions[0] if submissions else {}
                    
                    result = {
                        "application_number": item.get('application_number', ''),
                        "brand_name": item.get('products', [{}])[0].get('brand_name', ''),
                        "generic_name": item.get('products', [{}])[0].get('active_ingredients', [{}])[0].get('name', ''),
                        "approval_date": latest_submission.get('submission_status_date', ''),
                        "sponsor": item.get('sponsor_name', ''),
                        "submission_type": latest_submission.get('submission_type', ''),
                        "url": f"https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo={item.get('application_number', '')}",
                        "source": "FDA"
                    }
                    results.append(result)
            
        except Exception as e:
            print(f"    FDA API error: {str(e)}")
            # Fallback to web scraping FDA site
            results = self._scrape_fda_approvals(query, max_results)
        
        return results
    
    def _scrape_fda_approvals(self, query: str, max_results: int) -> List[Dict]:
        """Fallback: scrape FDA news for approvals"""
        results = []
        
        try:
            # FDA press announcements feed
            feed_url = "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-announcements/rss.xml"
            feed = feedparser.parse(feed_url)
            
            query_lower = query.lower()
            
            for entry in feed.entries[:max_results * 2]:  # Get more to filter
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                
                # Check if related to query
                if query_lower in title or query_lower in summary:
                    result = {
                        "title": entry.get('title', ''),
                        "summary": entry.get('summary', ''),
                        "link": entry.get('link', ''),
                        "published_date": entry.get('published', ''),
                        "source": "FDA Press Announcements"
                    }
                    results.append(result)
                    
                    if len(results) >= max_results:
                        break
        
        except Exception as e:
            print(f"    FDA scraping error: {str(e)}")
        
        return results
