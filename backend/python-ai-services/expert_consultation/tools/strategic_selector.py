from typing import List, Dict, Any
import asyncio

class StrategicToolSelector:
    """Intelligent tool selection based on query domain and context"""
    
    # Domain-to-Tool mapping aligned with 30 knowledge domains
    TOOL_TAXONOMY = {
        # Tier 1 Core Domains
        "regulatory_affairs": ["fda_database", "ema_database", "fda_guidance", "regulatory_calculator"],
        "clinical_development": ["clinical_trials", "study_design", "endpoint_selection", "pubmed_search"],
        "pharmacovigilance": ["fda_database", "ema_database", "drug_interaction", "pubmed_search"],
        "quality_management": ["fda_guidance", "regulatory_calculator", "rag_search"],
        "medical_affairs": ["pubmed_search", "cochrane_reviews", "rag_search"],
        "commercial_strategy": ["web_search", "budget_calculator", "rag_search"],
        "drug_development": ["pubmed_search", "clinical_trials", "rag_search"],
        "clinical_data_analytics": ["data_calculator", "pubmed_search", "rag_search"],
        "manufacturing_operations": ["fda_guidance", "rag_search"],
        "medical_devices": ["fda_database", "clinical_trials", "rag_search"],
        "digital_health": ["web_search", "pubmed_search", "clinical_trials"],
        "supply_chain": ["web_search", "rag_search"],
        "legal_compliance": ["fda_guidance", "ema_database", "rag_search"],
        "health_economics": ["web_search", "budget_calculator", "rag_search"],
        "business_strategy": ["web_search", "budget_calculator", "rag_search"],
        
        # Tier 2 Specialized Domains
        "product_labeling": ["fda_guidance", "ema_database", "rag_search"],
        "post_market_activities": ["fda_database", "clinical_trials", "pubmed_search"],
        "companion_diagnostics": ["fda_database", "clinical_trials", "pubmed_search"],
        "nonclinical_sciences": ["pubmed_search", "arxiv_search", "rag_search"],
        "patient_focus": ["web_search", "clinical_trials", "rag_search"],
        "risk_management": ["fda_database", "regulatory_calculator", "rag_search"],
        "scientific_publications": ["pubmed_search", "cochrane_reviews", "arxiv_search"],
        "kol_stakeholder": ["web_search", "pubmed_search", "rag_search"],
        "evidence_generation": ["pubmed_search", "clinical_trials", "cochrane_reviews"],
        "global_market_access": ["web_search", "ema_database", "who_database"],
        
        # Tier 3 Emerging Domains
        "real_world_data": ["pubmed_search", "web_search", "data_calculator"],
        "precision_medicine": ["pubmed_search", "clinical_trials", "web_search"],
        "telemedicine": ["web_search", "pubmed_search", "clinical_trials"],
        "ai_ml_healthcare": ["pubmed_search", "arxiv_search", "web_search"],
        "value_based_care": ["web_search", "budget_calculator", "rag_search"]
    }
    
    def __init__(self, llm, rag_connector, tool_registry):
        self.llm = llm
        self.rag = rag_connector
        self.tools = tool_registry
    
    async def select_optimal_tools(
        self, 
        query: str, 
        detected_domains: List[str],
        max_tools: int = 5
    ) -> List[str]:
        """Select optimal tools based on query and detected domains"""
        
        # Get recommended tools for detected domains
        recommended_tools = set()
        for domain in detected_domains:
            if domain in self.TOOL_TAXONOMY:
                recommended_tools.update(self.TOOL_TAXONOMY[domain])
        
        # Always include RAG search for domain-specific knowledge
        if "rag_search" not in recommended_tools:
            recommended_tools.add("rag_search")
        
        # If no domains detected, use general tools
        if not recommended_tools:
            recommended_tools = {"web_search", "pubmed_search", "rag_search", "agent_lookup"}
        
        # Use LLM to refine selection if we have too many tools
        if len(recommended_tools) > max_tools:
            selected = await self._llm_tool_selection(
                query, 
                list(recommended_tools),
                max_tools
            )
        else:
            selected = list(recommended_tools)
        
        return selected[:max_tools]
    
    async def _llm_tool_selection(
        self, 
        query: str, 
        available_tools: List[str],
        max_tools: int
    ) -> List[str]:
        """Use LLM to intelligently select tools"""
        try:
            # Create a prompt for tool selection
            tool_descriptions = {
                "web_search": "Search the internet for current information and news",
                "pubmed_search": "Search medical literature and research papers",
                "fda_database": "Search FDA drug approvals and regulatory data",
                "ema_database": "Search European Medicines Agency data",
                "clinical_trials": "Search clinical trials and studies",
                "rag_search": "Search internal knowledge base across all domains",
                "agent_lookup": "Find relevant expert agents",
                "calculator": "Perform mathematical calculations",
                "budget_calculator": "Calculate financial projections",
                "regulatory_calculator": "Calculate regulatory timelines and costs"
            }
            
            available_descriptions = [
                f"- {tool}: {tool_descriptions.get(tool, 'Tool description not available')}"
                for tool in available_tools
            ]
            
            prompt = f"""
            Query: "{query}"
            
            Available tools:
            {chr(10).join(available_descriptions)}
            
            Select the {max_tools} most relevant tools for this query.
            Prioritize tools that will provide the most valuable evidence.
            Return only the tool names, separated by commas.
            """
            
            # Use LLM to select tools
            response = await self.llm.ainvoke(prompt)
            
            # Parse response
            selected_tools = []
            if hasattr(response, 'content'):
                content = response.content
            else:
                content = str(response)
            
            # Extract tool names from response
            for tool in available_tools:
                if tool in content.lower():
                    selected_tools.append(tool)
            
            # Fallback if LLM selection fails
            if not selected_tools:
                selected_tools = available_tools[:max_tools]
            
            return selected_tools
            
        except Exception as e:
            print(f"LLM tool selection error: {e}")
            # Fallback to first N tools
            return available_tools[:max_tools]
    
    def get_tools_for_domain(self, domain: str) -> List[str]:
        """Get recommended tools for a specific domain"""
        return self.TOOL_TAXONOMY.get(domain, [])
    
    def get_domains_for_tool(self, tool: str) -> List[str]:
        """Get domains that use a specific tool"""
        domains = []
        for domain, tools in self.TOOL_TAXONOMY.items():
            if tool in tools:
                domains.append(domain)
        return domains
    
    def get_tool_priority(self, tool: str, domain: str) -> int:
        """Get priority of a tool for a domain (1=highest, 5=lowest)"""
        if domain not in self.TOOL_TAXONOMY:
            return 5
        
        tools = self.TOOL_TAXONOMY[domain]
        if tool not in tools:
            return 5
        
        # Return position in list (earlier = higher priority)
        return tools.index(tool) + 1
