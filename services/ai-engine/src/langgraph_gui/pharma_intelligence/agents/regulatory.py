"""
RegulatoryAgent - Specialized agent for pharmaceutical research.
"""

"""
Specialized Agent Implementations
Each agent has domain-specific prompts and expertise
"""

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict
import json
from datetime import datetime

class RegulatoryAgent:
    """
    Specialized in regulatory requirements, FDA/EMA approvals, compliance
    """
    
    def __init__(self, llm: BaseChatModel, tools: Dict):
        self.llm = llm
        self.tools = tools
        
        self.system_prompt = """You are a Regulatory Affairs Specialist with expertise in:
- FDA regulations and approval pathways
- EMA guidelines and procedures
- Regulatory compliance requirements
- 510(k), PMA, De Novo pathways
- Clinical trial regulations
- Post-market surveillance

Your mission is to provide accurate regulatory guidance and track approvals.

Tools available:
- fda: Search FDA databases for approvals and guidance
- web: Search for regulatory news and updates
- rag: Query internal regulatory intelligence
- scraper: Scrape FDA/EMA announcements

Research Process:
1. Search FDA databases for official information
2. Check for recent regulatory news
3. Query RAG for internal regulatory insights
4. Scrape FDA/EMA announcements
5. Analyze regulatory pathways
6. Provide compliance guidance

Return format:
- Regulatory findings with citations
- Pathway recommendations
- Compliance requirements
- Confidence score (0-1)"""
    
    def research(self, query: str, objectives: List[str], context: Dict) -> Dict:
        """Execute regulatory research"""
        
        findings_list = []
        all_sources = []
        
        print("  ⚖️  Searching FDA database...")
        try:
            fda_results = self.tools['fda'].search(query, max_results=10)
            findings_list.append({
                "source": "FDA",
                "results": fda_results,
                "count": len(fda_results)
            })
            all_sources.extend(fda_results)
        except Exception as e:
            print(f"    ⚠️  FDA error: {str(e)}")
        
        print("  🌐 Searching regulatory news...")
        try:
            web_results = self.tools['web'].search(query + " FDA approval regulatory", max_results=10)
            findings_list.append({
                "source": "Regulatory News",
                "results": web_results,
                "count": len(web_results)
            })
            all_sources.extend(web_results)
        except Exception as e:
            print(f"    ⚠️  Web error: {str(e)}")
        
        print("  📚 Querying RAG...")
        try:
            rag_results = self.tools['rag'].search(query, top_k=5, filter_domain="regulatory")
            findings_list.append({
                "source": "Internal Knowledge Base",
                "results": rag_results,
                "count": len(rag_results)
            })
        except Exception as e:
            print(f"    ⚠️  RAG error: {str(e)}")
        
        print("  📰 Scraping FDA announcements...")
        try:
            scraper_results = self.tools['scraper'].scrape_regulatory_news(query)
            findings_list.append({
                "source": "FDA Announcements",
                "results": scraper_results,
                "count": len(scraper_results)
            })
            all_sources.extend(scraper_results)
        except Exception as e:
            print(f"    ⚠️  Scraper error: {str(e)}")
        
        # Synthesize findings
        synthesis_prompt = f"""{self.system_prompt}

Query: {query}
Objectives: {', '.join(objectives)}

Research Results:
{json.dumps(findings_list, indent=2)}

Synthesize these findings into a comprehensive regulatory analysis.
Include:
1. Regulatory status and approvals
2. Pathway recommendations
3. Compliance requirements
4. Timeline expectations

Format as structured text with clear sections."""
        
        synthesis = self.llm.invoke(synthesis_prompt)
        
        confidence = self._calculate_confidence(findings_list)
        
        return {
            "agent_name": "Regulatory Agent",
            "domain": "regulatory",
            "findings": synthesis.content,
            "sources": all_sources,
            "confidence_score": confidence,
            "timestamp": datetime.now().isoformat()
        }
    
    def _calculate_confidence(self, findings_list: List[Dict]) -> float:
        """Calculate confidence based on source quality"""
        total_sources = sum(f['count'] for f in findings_list)
        
        quality_weights = {
            "FDA": 1.0,
            "Regulatory News": 0.7,
            "Internal Knowledge Base": 0.8,
            "FDA Announcements": 0.9
        }
        
        weighted_sum = 0
        for finding in findings_list:
            weight = quality_weights.get(finding['source'], 0.5)
            weighted_sum += finding['count'] * weight
        
        if total_sources == 0:
            return 0.3
        
        confidence = min(weighted_sum / 15, 1.0)
        return confidence
