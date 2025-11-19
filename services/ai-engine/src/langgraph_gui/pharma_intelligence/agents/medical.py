"""
MedicalResearchAgent - Specialized agent for pharmaceutical research.
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

class MedicalResearchAgent:
    """
    Specialized in medical research, clinical trials, drug mechanisms
    """
    
    def __init__(self, llm: BaseChatModel, tools: Dict):
        self.llm = llm
        self.tools = tools
        
        self.system_prompt = """You are a Medical Research Specialist with expertise in:
- Clinical research and trial design
- Pharmacology and drug mechanisms
- Efficacy and safety data
- Treatment guidelines
- Medical literature analysis

Your mission is to find and analyze medical evidence with scientific rigor.

Tools available:
- pubmed: Search PubMed/MEDLINE for peer-reviewed research
- clinical_trials: Search ClinicalTrials.gov for trial data
- rag: Query internal knowledge base
- scraper: Scrape recent medical news and updates

Research Process:
1. Search PubMed for peer-reviewed research
2. Check ClinicalTrials.gov for trial data
3. Query RAG for recent internal intelligence
4. Scrape latest medical news if needed
5. Synthesize findings with citations
6. Assess confidence based on evidence quality

Return format:
- Key findings with citations
- Evidence quality assessment
- Confidence score (0-1)
- Source list"""
    
    def research(self, query: str, objectives: List[str], context: Dict) -> Dict:
        """Execute medical research"""
        
        # Get tool limits from research plan (OPTIMIZATION)
        research_plan = context.get('research_plan', {})
        tool_limits = research_plan.get('tool_limits', {})
        query_type = research_plan.get('query_type', 'research')
        
        max_pubmed = tool_limits.get('max_pubmed', 10)
        max_trials = tool_limits.get('max_trials', 10)
        prioritize_scraper = tool_limits.get('prioritize_scraper', False)
        
        findings_list = []
        all_sources = []
        
        # For NEWS queries, scraper first (fastest, most relevant)
        if prioritize_scraper:
            print("  📰 Prioritizing recent news scraper...")
            try:
                scraper_results = self.tools['scraper'].scrape_medical_news(query, max_results=15)
                findings_list.append({
                    "source": "Medical News Scraper (Priority)",
                    "results": scraper_results,
                    "count": len(scraper_results)
                })
                all_sources.extend(scraper_results)
            except Exception as e:
                print(f"    ⚠️  Scraper error: {str(e)}")
        
        # PubMed with dynamic limits
        print(f"  🔬 Searching PubMed (limit: {max_pubmed})...")
        try:
            pubmed_results = self.tools['pubmed'].search(query, max_results=max_pubmed)
            findings_list.append({
                "source": "PubMed",
                "results": pubmed_results,
                "count": len(pubmed_results)
            })
            all_sources.extend(pubmed_results)
        except Exception as e:
            print(f"    ⚠️  PubMed error: {str(e)}")
        
        # Clinical Trials with dynamic limits
        print(f"  🧪 Searching Clinical Trials (limit: {max_trials})...")
        try:
            ct_results = self.tools['clinical_trials'].search(query, max_results=max_trials)
            findings_list.append({
                "source": "ClinicalTrials.gov",
                "results": ct_results,
                "count": len(ct_results)
            })
            all_sources.extend(ct_results)
        except Exception as e:
            print(f"    ⚠️  ClinicalTrials error: {str(e)}")
        
        # RAG (always fast)
        print("  📚 Querying RAG...")
        try:
            rag_results = self.tools['rag'].search(query, top_k=5, filter_domain="medical")
            findings_list.append({
                "source": "Internal Knowledge Base",
                "results": rag_results,
                "count": len(rag_results)
            })
        except Exception as e:
            print(f"    ⚠️  RAG error: {str(e)}")
        
        # Scraper last if not prioritized (for research queries)
        if not prioritize_scraper:
            print("  📰 Scraping medical news...")
            try:
                scraper_results = self.tools['scraper'].scrape_medical_news(query, max_results=5)
                findings_list.append({
                    "source": "Medical News",
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

Synthesize these findings into a comprehensive medical research summary.
Include:
1. Key findings with citations
2. Clinical significance
3. Evidence quality
4. Confidence assessment

Format as structured text with clear sections."""
        
        synthesis = self.llm.invoke(synthesis_prompt)
        
        # Calculate confidence
        confidence = self._calculate_confidence(findings_list)
        
        return {
            "agent_name": "Medical Research Agent",
            "domain": "medical",
            "findings": synthesis.content,
            "sources": all_sources,
            "confidence_score": confidence,
            "timestamp": datetime.now().isoformat()
        }
    
    def _calculate_confidence(self, findings_list: List[Dict]) -> float:
        """Calculate confidence based on source quality and quantity"""
        total_sources = sum(f['count'] for f in findings_list)
        
        # Weight by source quality
        quality_weights = {
            "PubMed": 1.0,
            "ClinicalTrials.gov": 0.9,
            "Internal Knowledge Base": 0.8,
            "Medical News": 0.6
        }
        
        weighted_sum = 0
        for finding in findings_list:
            weight = quality_weights.get(finding['source'], 0.5)
            weighted_sum += finding['count'] * weight
        
        # Normalize to 0-1
        if total_sources == 0:
            return 0.3
        
        confidence = min(weighted_sum / 20, 1.0)  # Max at 20 weighted sources
        return confidence
