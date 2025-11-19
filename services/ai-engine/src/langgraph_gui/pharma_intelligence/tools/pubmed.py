"""
PubMedSearchTool - Tool for accessing pharmaceutical data sources.
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

class PubMedSearchTool:
    """
    Search PubMed/MEDLINE database
    """
    
    def __init__(self, email: str = "your_email@example.com"):
        # Set your email for NCBI
        Entrez.email = email
    
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search PubMed"""
        results = []
        
        try:
            # Search PubMed
            handle = Entrez.esearch(
                db="pubmed",
                term=query,
                retmax=max_results,
                sort="relevance"
            )
            record = Entrez.read(handle)
            handle.close()
            
            id_list = record["IdList"]
            
            if not id_list:
                return []
            
            # Fetch details
            handle = Entrez.efetch(
                db="pubmed",
                id=id_list,
                rettype="medline",
                retmode="xml"
            )
            records = Entrez.read(handle)
            handle.close()
            
            # Parse results
            for article in records['PubmedArticle']:
                medline = article['MedlineCitation']
                article_data = medline['Article']
                
                # Extract authors
                authors = []
                if 'AuthorList' in article_data:
                    for author in article_data['AuthorList'][:3]:  # First 3 authors
                        if 'LastName' in author and 'Initials' in author:
                            authors.append(f"{author['LastName']} {author['Initials']}")
                
                # Extract abstract
                abstract = ""
                if 'Abstract' in article_data:
                    abstract_parts = article_data['Abstract'].get('AbstractText', [])
                    abstract = " ".join([str(part) for part in abstract_parts])
                
                result = {
                    "pmid": str(medline['PMID']),
                    "title": str(article_data.get('ArticleTitle', '')),
                    "abstract": abstract,
                    "authors": authors,
                    "journal": str(article_data.get('Journal', {}).get('Title', '')),
                    "pub_date": self._extract_date(article_data),
                    "link": f"https://pubmed.ncbi.nlm.nih.gov/{medline['PMID']}/",
                    "source": "PubMed"
                }
                
                results.append(result)
        
        except Exception as e:
            print(f"    PubMed search error: {str(e)}")
        
        return results
    
    def _extract_date(self, article_data: Dict) -> str:
        """Extract publication date"""
        try:
            journal = article_data.get('Journal', {})
            issue = journal.get('JournalIssue', {})
            pub_date = issue.get('PubDate', {})
            
            year = pub_date.get('Year', '')
            month = pub_date.get('Month', '')
            day = pub_date.get('Day', '')
            
            return f"{year}-{month}-{day}".strip('-')
        except:
            return ""
