"""
DigitalHealthAgent - Specialized agent for pharmaceutical research.
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

class DigitalHealthAgent:
    """
    Specialized in digital health, health tech innovations, digital therapeutics
    """
    
    def __init__(self, llm: BaseChatModel, tools: Dict):
        self.llm = llm
        self.tools = tools
        
        self.system_prompt = """You are a Digital Health Innovation Specialist with expertise in:
- Digital therapeutics (DTx) and mobile health
- Health AI/ML applications
- Wearables and remote monitoring
- Telemedicine platforms
- Health data analytics
- Digital health regulations (FDA 510k, etc.)

Your mission is to identify cutting-edge digital health innovations and trends.

Tools available:
- arxiv: Search for academic research on health tech
- web: Search web for news, products, startups
- rag: Query internal digital health intelligence
- scraper: Scrape health tech news and product launches

Research Process:
1. Search arXiv for latest academic research
2. Search web for products, startups, funding
3. Query RAG for internal insights
4. Scrape health tech news sites
5. Identify trends and innovations
6. Assess market readiness

Return format:
- Key innovations with descriptions
- Market analysis
- Technology assessment
- Confidence score (0-1)"""
    
    def research(self, query: str, objectives: List[str], context: Dict) -> Dict:
        """Execute digital health research"""
        
        findings_list = []
        all_sources = []
        
        print("  📚 Searching arXiv...")
        try:
            arxiv_results = self.tools['arxiv'].search(query + " health technology", max_results=10)
            findings_list.append({
                "source": "arXiv",
                "results": arxiv_results,
                "count": len(arxiv_results)
            })
            all_sources.extend(arxiv_results)
        except Exception as e:
            print(f"    ⚠️  arXiv error: {str(e)}")
        
        print("  🌐 Searching web...")
        try:
            web_results = self.tools['web'].search(query + " digital health", max_results=15)
            findings_list.append({
                "source": "Web",
                "results": web_results,
                "count": len(web_results)
            })
            all_sources.extend(web_results)
        except Exception as e:
            print(f"    ⚠️  Web error: {str(e)}")
        
        print("  📚 Querying RAG...")
        try:
            rag_results = self.tools['rag'].search(query, top_k=5, filter_domain="digital_health")
            findings_list.append({
                "source": "Internal Knowledge Base",
                "results": rag_results,
                "count": len(rag_results)
            })
        except Exception as e:
            print(f"    ⚠️  RAG error: {str(e)}")
        
        print("  📰 Scraping health tech news...")
        try:
            scraper_results = self.tools['scraper'].scrape_healthtech_news(query)
            findings_list.append({
                "source": "Health Tech News",
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

Synthesize these findings into a comprehensive digital health analysis.
Include:
1. Key innovations and trends
2. Technology assessments
3. Market opportunities
4. Regulatory considerations

Format as structured text with clear sections."""
        
        synthesis = self.llm.invoke(synthesis_prompt)
        
        confidence = self._calculate_confidence(findings_list)
        
        return {
            "agent_name": "Digital Health Agent",
            "domain": "digital_health",
            "findings": synthesis.content,
            "sources": all_sources,
            "confidence_score": confidence,
            "timestamp": datetime.now().isoformat()
        }
    
    def _calculate_confidence(self, findings_list: List[Dict]) -> float:
        """Calculate confidence based on source quality"""
        total_sources = sum(f['count'] for f in findings_list)
        
        quality_weights = {
            "arXiv": 0.9,
            "Web": 0.7,
            "Internal Knowledge Base": 0.8,
            "Health Tech News": 0.7
        }
        
        weighted_sum = 0
        for finding in findings_list:
            weight = quality_weights.get(finding['source'], 0.5)
            weighted_sum += finding['count'] * weight
        
        if total_sources == 0:
            return 0.3
        
        confidence = min(weighted_sum / 20, 1.0)
        return confidence
