"""
ClinicalTrialsSearchTool - Tool for accessing pharmaceutical data sources.
"""

"""
Search Tools: PubMed, Web Search, arXiv
"""

import requests
from typing import List, Dict
# Conditional Bio import - only import when needed (not actually used in this file)
try:
    from Bio import Entrez
    BIO_AVAILABLE = True
except ImportError:
    Entrez = None
    BIO_AVAILABLE = False
import urllib.request
import urllib.parse
from xml.etree.ElementTree import fromstring
import json

class ClinicalTrialsSearchTool:
    """
    Search ClinicalTrials.gov (bonus tool)
    """
    
    def __init__(self):
        self.base_url = "https://clinicaltrials.gov/api/v2/studies"
    
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search ClinicalTrials.gov"""
        results = []
        
        try:
            params = {
                'query.term': query,
                'pageSize': max_results,
                'format': 'json'
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()
            
            for study in data.get('studies', []):
                protocol = study.get('protocolSection', {})
                identification = protocol.get('identificationModule', {})
                status = protocol.get('statusModule', {})
                description = protocol.get('descriptionModule', {})
                
                result = {
                    "nct_id": identification.get('nctId', ''),
                    "title": identification.get('briefTitle', ''),
                    "status": status.get('overallStatus', ''),
                    "phase": status.get('phase', ''),
                    "summary": description.get('briefSummary', ''),
                    "url": f"https://clinicaltrials.gov/study/{identification.get('nctId', '')}",
                    "source": "ClinicalTrials.gov"
                }
                
                results.append(result)
        
        except Exception as e:
            print(f"    ClinicalTrials search error: {str(e)}")
        
        return results
