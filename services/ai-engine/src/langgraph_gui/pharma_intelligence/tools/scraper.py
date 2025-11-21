"""
ScraperTool - Tool for accessing pharmaceutical data sources.
"""

"""
Enhanced Tools for Specialized Agents
Includes scraper as a tool alongside search tools
All tools are production-ready with real API implementations
"""

from typing import List, Dict
import requests
# Conditional Bio import - only import when needed
try:
    from Bio import Entrez
    BIO_AVAILABLE = True
except ImportError:
    Entrez = None
    BIO_AVAILABLE = False
import urllib.request
import urllib.parse
from xml.etree.ElementTree import fromstring
# Conditional feedparser import - only import when needed
try:
    import feedparser
    FEEDPARSER_AVAILABLE = True
except ImportError:
    feedparser = None
    FEEDPARSER_AVAILABLE = False
# Conditional BeautifulSoup import - only import when needed
try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BeautifulSoup = None
    BS4_AVAILABLE = False
from datetime import datetime
import time
import sys
import os

# Import real, production-ready tools from the same package
from .pubmed import PubMedSearchTool
from .web_search import WebSearchTool
from .arxiv import ArXivSearchTool
from .clinical_trials import ClinicalTrialsSearchTool

class ScraperTool:
    """
    Multi-domain scraper tool for pharma/medical/health tech news
    Integrated as a tool alongside search tools
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Define sources by domain
        self.medical_sources = {
            "medscape": "https://www.medscape.com/",
            "nejm": "https://www.nejm.org/",
            "lancet": "https://www.thelancet.com/"
        }
        
        self.healthtech_sources = {
            "mobihealthnews": "https://www.mobihealthnews.com/",
            "healthcareitnews": "https://www.healthcareitnews.com/",
            "hitconsultant": "https://hitconsultant.net/"
        }
        
        self.regulatory_sources = {
            "fda_news": "https://www.fda.gov/news-events/fda-newsroom/press-announcements",
            "raps": "https://www.raps.org/news-and-articles"
        }
        
        self.pharma_sources = {
            "fiercepharma": "https://www.fiercepharma.com/rss/xml",
            "biopharma": "https://www.biopharmadive.com/feeds/news/",
            "pharmalive": "https://www.pharmalive.com/"
        }
    
    def scrape_medical_news(self, query: str, max_results: int = 10, days_back: int = 30) -> List[Dict]:
        """Scrape medical news related to query
        
        Args:
            query: Search query
            max_results: Max results to return
            days_back: Only return news from last N days (default 30)
        """
        from datetime import datetime, timedelta
        
        all_results = []
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Try RSS feeds first (most reliable)
        if not FEEDPARSER_AVAILABLE:
            print("    Warning: feedparser not installed, skipping RSS feed parsing")
            return []
        
        try:
            # PubMed recent articles with date filter
            pubmed_feed = f"https://pubmed.ncbi.nlm.nih.gov/rss/search/?term={urllib.parse.quote(query)}&limit={max_results * 2}&sort=date"
            feed = feedparser.parse(pubmed_feed)
            
            for entry in feed.entries[:max_results * 2]:  # Get extra, filter later
                try:
                    # Parse published date
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        pub_date = datetime(*entry.published_parsed[:6])
                    else:
                        # If no date, assume it's recent
                        pub_date = datetime.now()
                    
                    # Only include if within date range
                    if pub_date >= cutoff_date:
                        days_old = (datetime.now() - pub_date).days
                        result = {
                            "title": entry.get('title', ''),
                            "summary": entry.get('summary', ''),
                            "link": entry.get('link', ''),
                            "published_date": pub_date.strftime('%Y-%m-%d'),
                            "days_old": days_old,
                            "source": "PubMed Recent"
                        }
                        all_results.append(result)
                except Exception:
                    # Skip entries with parsing errors
                    continue
        
        except Exception as e:
            print(f"      Medical scraping error: {str(e)}")
        
        # Sort by most recent first
        all_results.sort(key=lambda x: x.get('days_old', 999))
        
        return all_results[:max_results]
    
    def scrape_healthtech_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """Scrape health tech news"""
        all_results = []
        
        if not FEEDPARSER_AVAILABLE:
            print("    Warning: feedparser not installed, skipping healthtech RSS feed parsing")
            return all_results
        
        # MobiHealthNews RSS
        try:
            feed_url = "https://www.mobihealthnews.com/feed"
            feed = feedparser.parse(feed_url)
            
            query_lower = query.lower()
            
            for entry in feed.entries:
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                
                if query_lower in title or query_lower in summary:
                    result = {
                        "title": entry.get('title', ''),
                        "summary": entry.get('summary', ''),
                        "link": entry.get('link', ''),
                        "published_date": entry.get('published', ''),
                        "source": "MobiHealthNews"
                    }
                    all_results.append(result)
                    
                    if len(all_results) >= max_results:
                        break
        
        except Exception as e:
            print(f"      HealthTech scraping error: {str(e)}")
        
        return all_results[:max_results]
    
    def scrape_regulatory_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """Scrape regulatory news"""
        all_results = []
        
        if not FEEDPARSER_AVAILABLE:
            print("    Warning: feedparser not installed, skipping regulatory RSS feed parsing")
            return all_results
        
        # FDA Press Announcements
        try:
            feed_url = "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-announcements/rss.xml"
            feed = feedparser.parse(feed_url)
            
            query_lower = query.lower()
            
            for entry in feed.entries:
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                
                if query_lower in title or query_lower in summary or 'approval' in title:
                    result = {
                        "title": entry.get('title', ''),
                        "summary": entry.get('summary', ''),
                        "link": entry.get('link', ''),
                        "published_date": entry.get('published', ''),
                        "source": "FDA Press Announcements"
                    }
                    all_results.append(result)
                    
                    if len(all_results) >= max_results:
                        break
        
        except Exception as e:
            print(f"      Regulatory scraping error: {str(e)}")
        
        return all_results[:max_results]
    
    def scrape_pharma_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """Scrape general pharma news"""
        all_results = []
        
        # FiercePharma RSS
        try:
            feed_url = "https://www.fiercepharma.com/rss/xml"
            feed = feedparser.parse(feed_url)
            
            query_lower = query.lower()
            
            for entry in feed.entries:
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                
                if not query or query_lower in title or query_lower in summary:
                    result = {
                        "title": entry.get('title', ''),
                        "summary": entry.get('summary', ''),
                        "link": entry.get('link', ''),
                        "published_date": entry.get('published', ''),
                        "source": "FiercePharma"
                    }
                    all_results.append(result)
                    
                    if len(all_results) >= max_results:
                        break
        
        except Exception as e:
            print(f"      Pharma scraping error: {str(e)}")
        
        # BioPharma Dive RSS
        if not FEEDPARSER_AVAILABLE:
            return all_results[:max_results]
        
        try:
            feed_url = "https://www.biopharmadive.com/feeds/news/"
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries:
                if len(all_results) >= max_results:
                    break
                
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                
                if not query or query_lower in title or query_lower in summary:
                    result = {
                        "title": entry.get('title', ''),
                        "summary": entry.get('summary', ''),
                        "link": entry.get('link', ''),
                        "published_date": entry.get('published', ''),
                        "source": "BioPharma Dive"
                    }
                    all_results.append(result)
        
        except Exception as e:
            print(f"      BioPharma scraping error: {str(e)}")
        
        return all_results[:max_results]
    
    def scrape_all_domains(self, query: str, max_per_domain: int = 5) -> Dict[str, List[Dict]]:
        """Scrape across all domains"""
        return {
            "medical": self.scrape_medical_news(query, max_per_domain),
            "healthtech": self.scrape_healthtech_news(query, max_per_domain),
            "regulatory": self.scrape_regulatory_news(query, max_per_domain),
            "pharma": self.scrape_pharma_news(query, max_per_domain)
        }


# Export all tools
__all__ = [
    'PubMedSearchTool',
    'WebSearchTool',
    'ArXivSearchTool',
    'ClinicalTrialsSearchTool',
    'FDASearchTool',
    'ScraperTool'
]
