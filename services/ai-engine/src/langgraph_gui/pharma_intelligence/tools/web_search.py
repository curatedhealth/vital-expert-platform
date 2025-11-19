"""
WebSearchTool - Tool for accessing pharmaceutical data sources.
"""

"""
Search Tools: PubMed, Web Search, arXiv
"""

import requests
from typing import List, Dict
from Bio import Entrez
import urllib.request
import urllib.parse
from xml.etree.ElementTree import fromstring
import json

class WebSearchTool:
    """
    Web search using DuckDuckGo (no API key needed)
    Alternative: SerpAPI, Brave Search API
    """
    
    def __init__(self):
        self.base_url = "https://api.duckduckgo.com/"
    
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search the web"""
        results = []
        
        try:
            # DuckDuckGo Instant Answer API
            params = {
                'q': query,
                'format': 'json',
                'no_html': 1,
                'skip_disambig': 1
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()
            
            # Extract related topics
            if 'RelatedTopics' in data:
                for i, topic in enumerate(data['RelatedTopics'][:max_results]):
                    if isinstance(topic, dict) and 'Text' in topic:
                        result = {
                            "title": topic.get('Text', '')[:100],
                            "snippet": topic.get('Text', ''),
                            "url": topic.get('FirstURL', ''),
                            "source": "DuckDuckGo"
                        }
                        results.append(result)
            
            # Also include abstract if available
            if data.get('Abstract'):
                results.insert(0, {
                    "title": data.get('Heading', query),
                    "snippet": data.get('Abstract', ''),
                    "url": data.get('AbstractURL', ''),
                    "source": "DuckDuckGo"
                })
        
        except Exception as e:
            print(f"    Web search error: {str(e)}")
        
        return results
