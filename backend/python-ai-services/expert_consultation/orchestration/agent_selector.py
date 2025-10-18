"""
Agent Selection Algorithm for VITAL Ask Expert Service

Provides intelligent agent selection capabilities for both automatic and manual modes.
Integrates with the existing agent store (372 agents) and knowledge domains (30 domains).
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import json
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from ..knowledge.agent_store_connector import AgentStoreConnector
from ..knowledge.rag_connector import MultiDomainRAGConnector


class AgentTier(Enum):
    """Agent expertise tiers"""
    TIER_1 = "tier_1"  # Senior/Principal level
    TIER_2 = "tier_2"  # Mid-level
    TIER_3 = "tier_3"  # Junior/Entry level


@dataclass
class AgentSelectionResult:
    """Result of agent selection process"""
    selected_agent: Dict[str, Any]
    confidence_score: float
    reasoning: str
    alternatives: List[Dict[str, Any]]
    domains_matched: List[str]
    capabilities_used: List[str]
    selection_time: datetime


@dataclass
class AgentSearchFilters:
    """Filters for manual agent selection"""
    domains: Optional[List[str]] = None
    tiers: Optional[List[AgentTier]] = None
    capabilities: Optional[List[str]] = None
    business_functions: Optional[List[str]] = None
    search_query: Optional[str] = None
    limit: int = 20


class AgentSelector:
    """Base class for agent selection algorithms"""
    
    def __init__(self, agent_store: AgentStoreConnector, rag_connector: MultiDomainRAGConnector, llm: ChatOpenAI):
        self.agent_store = agent_store
        self.rag_connector = rag_connector
        self.llm = llm
    
    async def select_agent(self, query: str, context: Dict[str, Any]) -> AgentSelectionResult:
        """Select the best agent for a given query"""
        raise NotImplementedError


class AutomaticAgentSelector(AgentSelector):
    """Intelligent automatic agent selection using LLM analysis"""
    
    def __init__(self, agent_store: AgentStoreConnector, rag_connector: MultiDomainRAGConnector, llm: ChatOpenAI):
        super().__init__(agent_store, rag_connector, llm)
        self.selection_prompt = self._build_selection_prompt()
    
    def _build_selection_prompt(self) -> str:
        """Build the agent selection prompt template"""
        return """
You are an expert agent selection system for VITAL's medical AI platform. Your task is to analyze user queries and select the most appropriate expert agent(s) from our database of 372 specialized medical AI agents.

Available Agent Categories:
- Regulatory Affairs (85 agents)
- Clinical Development (45 agents) 
- Medical Affairs (32 agents)
- Pharmacovigilance (28 agents)
- Digital Health (25 agents)
- Precision Medicine (20 agents)
- And 24 more specialized domains...

Total: 372 specialized medical AI agents

Agent Tiers:
- Tier 1: Senior/Principal level experts with 10+ years experience
- Tier 2: Mid-level experts with 5-10 years experience  
- Tier 3: Junior/Entry level experts with 1-5 years experience

Selection Criteria:
1. Domain relevance (primary factor)
2. Query complexity match with agent expertise level
3. Agent's specific capabilities and specializations
4. Recent performance and user satisfaction
5. Availability and response time

For each query, provide:
1. Primary agent recommendation with confidence score (0-1)
2. Reasoning for the selection
3. Alternative agents (2-3 options)
4. Matched knowledge domains
5. Key capabilities that will be used

Query: {query}
Business Context: {context}

Respond in JSON format:
{{
    "selected_agent": {{
        "id": "agent_id",
        "name": "Agent Name",
        "domain": "primary_domain",
        "tier": "tier_1",
        "confidence": 0.95,
        "reasoning": "Detailed reasoning...",
        "capabilities": ["capability1", "capability2"]
    }},
    "alternatives": [
        {{
            "id": "alt_agent_id",
            "name": "Alternative Agent",
            "domain": "related_domain", 
            "tier": "tier_2",
            "confidence": 0.78,
            "reasoning": "Why this alternative..."
        }}
    ],
    "domains_matched": ["domain1", "domain2"],
    "capabilities_used": ["capability1", "capability2"],
    "complexity_score": 0.8,
    "requires_multiple_agents": false
}}
"""
    
    async def select_agent(self, query: str, context: Dict[str, Any]) -> AgentSelectionResult:
        """Select the best agent using LLM analysis"""
        start_time = datetime.now()
        
        try:
            # Get available agents from store
            all_agents = await self.agent_store.get_all_agents()
            
            # Detect relevant domains
            domains = await self._detect_domains(query)
            
            # Filter agents by relevant domains
            relevant_agents = await self._filter_agents_by_domains(all_agents, domains)
            
            # Build selection prompt with agent data
            prompt = self.selection_prompt.format(
                query=query,
                context=json.dumps(context, indent=2)
            )
            
            # Add agent data to prompt
            agent_data = self._format_agents_for_prompt(relevant_agents[:50])  # Limit to top 50
            full_prompt = f"{prompt}\n\nAvailable Agents:\n{agent_data}"
            
            # Get LLM selection
            messages = [
                SystemMessage(content="You are an expert agent selection system. Always respond with valid JSON."),
                HumanMessage(content=full_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            selection_data = json.loads(response.content)
            
            # Get full agent details
            selected_agent = await self.agent_store.get_agent_details(selection_data["selected_agent"]["id"])
            
            # Build alternatives
            alternatives = []
            for alt in selection_data.get("alternatives", []):
                alt_details = await self.agent_store.get_agent_details(alt["id"])
                alternatives.append(alt_details)
            
            selection_time = (datetime.now() - start_time).total_seconds()
            
            return AgentSelectionResult(
                selected_agent=selected_agent,
                confidence_score=selection_data["selected_agent"]["confidence"],
                reasoning=selection_data["selected_agent"]["reasoning"],
                alternatives=alternatives,
                domains_matched=selection_data.get("domains_matched", []),
                capabilities_used=selection_data.get("capabilities_used", []),
                selection_time=selection_time
            )
            
        except Exception as e:
            # Fallback to simple domain-based selection
            return await self._fallback_selection(query, context, start_time)
    
    async def _detect_domains(self, query: str) -> List[str]:
        """Detect relevant knowledge domains from query"""
        # Use RAG connector to find relevant domains
        domain_results = await self.rag_connector.search_all_domains(query, top_k_per_domain=1)
        
        # Return domains with any results
        return [domain for domain, results in domain_results.items() if results]
    
    async def _filter_agents_by_domains(self, agents: List[Dict], domains: List[str]) -> List[Dict]:
        """Filter agents by relevant domains"""
        if not domains:
            return agents[:20]  # Return first 20 if no domains detected
        
        filtered = []
        for agent in agents:
            agent_domains = agent.get("domains", [])
            if any(domain in agent_domains for domain in domains):
                filtered.append(agent)
        
        return filtered[:50]  # Limit to top 50
    
    def _format_agents_for_prompt(self, agents: List[Dict]) -> str:
        """Format agent data for LLM prompt"""
        formatted = []
        for agent in agents:
            formatted.append(f"""
Agent ID: {agent.get('id', 'unknown')}
Name: {agent.get('name', 'Unknown')}
Domain: {agent.get('primary_domain', 'Unknown')}
Tier: {agent.get('tier', 'tier_2')}
Capabilities: {', '.join(agent.get('capabilities', []))}
Description: {agent.get('description', 'No description')}
""")
        return "\n".join(formatted)
    
    async def _fallback_selection(self, query: str, context: Dict[str, Any], start_time: datetime) -> AgentSelectionResult:
        """Fallback selection when LLM selection fails"""
        # Simple keyword-based selection
        query_lower = query.lower()
        
        # Map keywords to domains
        domain_keywords = {
            "regulatory": ["fda", "ema", "regulation", "approval", "submission"],
            "clinical": ["trial", "study", "patient", "efficacy", "safety"],
            "medical": ["medical", "physician", "diagnosis", "treatment"],
            "pharmacovigilance": ["adverse", "safety", "side effect", "monitoring"]
        }
        
        detected_domains = []
        for domain, keywords in domain_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_domains.append(domain)
        
        # Get agents from detected domains
        agents = await self.agent_store.get_agents_by_domains(detected_domains or ["regulatory"])
        
        # Select first agent as fallback
        selected_agent = agents[0] if agents else await self.agent_store.get_default_agent()
        
        selection_time = (datetime.now() - start_time).total_seconds()
        
        return AgentSelectionResult(
            selected_agent=selected_agent,
            confidence_score=0.5,  # Low confidence for fallback
            reasoning="Fallback selection based on keyword matching",
            alternatives=agents[1:3] if len(agents) > 1 else [],
            domains_matched=detected_domains,
            capabilities_used=[],
            selection_time=selection_time
        )


class ManualAgentSelector(AgentSelector):
    """Manual agent selection with search and filtering capabilities"""
    
    async def search_agents(self, filters: AgentSearchFilters) -> List[Dict[str, Any]]:
        """Search and filter agents based on criteria"""
        try:
            # Start with all agents
            agents = await self.agent_store.get_all_agents()
            
            # Apply filters
            if filters.domains:
                agents = [a for a in agents if any(d in a.get("domains", []) for d in filters.domains)]
            
            if filters.tiers:
                tier_values = [t.value for t in filters.tiers]
                agents = [a for a in agents if a.get("tier") in tier_values]
            
            if filters.capabilities:
                agents = [a for a in agents if any(c in a.get("capabilities", []) for c in filters.capabilities)]
            
            if filters.business_functions:
                agents = [a for a in agents if a.get("business_function") in filters.business_functions]
            
            if filters.search_query:
                query_lower = filters.search_query.lower()
                agents = [
                    a for a in agents 
                    if (query_lower in a.get("name", "").lower() or 
                        query_lower in a.get("description", "").lower() or
                        any(query_lower in cap.lower() for cap in a.get("capabilities", [])))
                ]
            
            # Sort by tier (Tier 1 first) and name
            tier_order = {"tier_1": 0, "tier_2": 1, "tier_3": 2}
            agents.sort(key=lambda x: (tier_order.get(x.get("tier", "tier_2"), 1), x.get("name", "")))
            
            return agents[:filters.limit]
            
        except Exception as e:
            # Return empty list on error
            return []
    
    async def get_agent_details(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific agent"""
        return await self.agent_store.get_agent_details(agent_id)
    
    async def get_agent_statistics(self, agent_id: str) -> Dict[str, Any]:
        """Get performance statistics for an agent"""
        # This would integrate with analytics system
        return {
            "total_queries": 0,
            "success_rate": 0.0,
            "avg_response_time": 0.0,
            "user_satisfaction": 0.0,
            "last_used": None
        }
    
    async def get_favorite_agents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's favorite agents"""
        # This would integrate with user preferences
        return []
    
    async def add_favorite_agent(self, user_id: str, agent_id: str) -> bool:
        """Add agent to user's favorites"""
        # This would integrate with user preferences
        return True
    
    async def get_recent_agents(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recently used agents by user"""
        # This would integrate with session history
        return []
