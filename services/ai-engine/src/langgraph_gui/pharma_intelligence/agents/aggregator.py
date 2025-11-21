"""
AggregatorAgent - Specialized agent for pharmaceutical research.
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

class AggregatorAgent:
    """
    Collects outputs from all agents, synthesizes, resolves conflicts, archives
    """
    
    def __init__(self, llm: BaseChatModel, rag_manager):
        self.llm = llm
        self.rag_manager = rag_manager
        
        self.aggregation_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Research Aggregator responsible for synthesizing multi-domain research.

Your role is to:
1. Collect findings from all specialized agents
2. Identify key themes and insights
3. Resolve any conflicts or contradictions
4. Cross-reference findings across domains
5. Create a cohesive synthesis

Return structured JSON:
{{
    "key_findings": ["finding 1", "finding 2", ...],
    "cross_domain_insights": ["insight 1", ...],
    "conflicts_resolved": [{{
        "conflict": "description",
        "resolution": "how resolved"
    }}],
    "confidence_by_domain": {{
        "medical": 0-1,
        "digital_health": 0-1,
        "regulatory": 0-1
    }},
    "synthesis": "comprehensive synthesis text",
    "all_sources": ["source list"],
    "gaps": ["what's missing or unclear"]
}}"""),
            ("human", """Query: {query}

Research Plan:
{research_plan}

Agent Outputs:
{agent_outputs}

Aggregate these findings.""")
        ])
    
    def aggregate(self, query: str, research_plan: Dict, agent_outputs: List[Dict]) -> Dict:
        """Aggregate all research outputs"""
        
        result = self.llm.invoke(
            self.aggregation_prompt.format(
                query=query,
                research_plan=json.dumps(research_plan, indent=2),
                agent_outputs=json.dumps(agent_outputs, indent=2)
            )
        )
        
        # Parse JSON
        content = result.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        aggregated = json.loads(content)
        
        # Collect all sources
        all_sources = []
        for output in agent_outputs:
            all_sources.extend(output.get('sources', []))
        
        aggregated['all_sources'] = all_sources
        aggregated['agent_outputs'] = agent_outputs
        
        return aggregated
