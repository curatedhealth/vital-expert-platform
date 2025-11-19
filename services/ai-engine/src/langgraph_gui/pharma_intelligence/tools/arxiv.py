"""
ArXivSearchTool - Tool for accessing pharmaceutical data sources.
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

class ArXivSearchTool:
    """
    Search arXiv for academic papers
    """
    
    def __init__(self):
        self.base_url = "http://export.arxiv.org/api/query"
    
    def search(self, query: str, max_results: int = 10, search_type: str = "all") -> List[Dict]:
        """Search arXiv"""
        results = []
        
        try:
            # Build query
            search_query = f"{search_type}:{query}"
            
            params = {
                'search_query': search_query,
                'max_results': str(max_results),
                'sortBy': 'relevance',
                'sortOrder': 'descending'
            }
            
            query_string = "&".join([f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items()])
            url = f"{self.base_url}?{query_string}"
            
            # Make request
            response = urllib.request.urlopen(url)
            response_text = response.read().decode('utf-8')
            
            # Parse XML
            root = fromstring(response_text)
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'arxiv': 'http://arxiv.org/schemas/atom'
            }
            
            # Extract entries
            for entry in root.findall('atom:entry', ns):
                # Extract data
                paper_id = self._get_text(entry, 'atom:id', ns)
                title = self._get_text(entry, 'atom:title', ns)
                summary = self._get_text(entry, 'atom:summary', ns)
                published = self._get_text(entry, 'atom:published', ns)
                
                # Extract authors
                authors = []
                for author in entry.findall('atom:author', ns):
                    name = self._get_text(author, 'atom:name', ns)
                    if name:
                        authors.append(name)
                
                # Get links
                pdf_url = None
                for link in entry.findall('atom:link', ns):
                    if link.get('title') == 'pdf':
                        pdf_url = link.get('href')
                
                result = {
                    "id": paper_id,
                    "title": title,
                    "summary": summary,
                    "authors": authors[:3],  # First 3 authors
                    "published": published,
                    "url": paper_id,
                    "pdf_url": pdf_url,
                    "source": "arXiv"
                }
                
                results.append(result)
        
        except Exception as e:
            print(f"    arXiv search error: {str(e)}")
        
        return results
    
    def _get_text(self, element, path: str, ns: dict) -> str:
        """Extract text from XML element"""
        el = element.find(path, ns)
        return el.text.strip() if el is not None and el.text else ""
