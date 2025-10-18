from langchain.tools import Tool
from typing import List, Dict, Any
import asyncio

class ComprehensiveToolRegistry:
    """Registry of all VITAL platform tools"""
    
    # Research & Literature Tools
    RESEARCH_TOOLS = [
        "web_search",           # Tavily web search
        "pubmed_search",        # PubMed/MEDLINE (35M+ citations)
        "cochrane_reviews",     # Cochrane systematic reviews
        "arxiv_search",         # ArXiv scientific papers
    ]
    
    # Regulatory & Compliance Tools
    REGULATORY_TOOLS = [
        "fda_database",         # FDA drugs, devices, adverse events
        "fda_guidance",         # FDA guidance documents
        "ema_database",         # European Medicines Agency
        "who_database",         # WHO International databases
        "regulatory_calculator", # Cost/timeline calculations
    ]
    
    # Clinical Tools
    CLINICAL_TOOLS = [
        "clinical_trials",      # ClinicalTrials.gov (470K+ studies)
        "study_design",         # Clinical study design helper
        "endpoint_selection",   # Clinical endpoint selector
        "drug_interaction",     # Drug-drug interactions
    ]
    
    # Knowledge & RAG Tools
    KNOWLEDGE_TOOLS = [
        "rag_search",           # Multi-domain RAG search
        "knowledge_base",       # Internal knowledge base
        "agent_lookup",         # Agent store search
    ]
    
    # Analysis Tools
    ANALYSIS_TOOLS = [
        "calculator",           # Mathematical calculations
        "data_calculator",      # Statistical analysis
        "budget_calculator",    # Financial projections
    ]
    
    def __init__(self, rag_connector, agent_connector):
        self.rag = rag_connector
        self.agent_store = agent_connector
        self.tools = self._initialize_all_tools()
    
    def _initialize_all_tools(self) -> Dict[str, Tool]:
        """Initialize all available tools"""
        tools = {}
        
        # Research tools
        tools["web_search"] = self._create_web_search_tool()
        tools["pubmed_search"] = self._create_pubmed_tool()
        tools["cochrane_reviews"] = self._create_cochrane_tool()
        tools["arxiv_search"] = self._create_arxiv_tool()
        
        # Regulatory tools
        tools["fda_database"] = self._create_fda_tool()
        tools["fda_guidance"] = self._create_fda_guidance_tool()
        tools["ema_database"] = self._create_ema_tool()
        tools["who_database"] = self._create_who_tool()
        tools["regulatory_calculator"] = self._create_regulatory_calculator_tool()
        
        # Clinical tools
        tools["clinical_trials"] = self._create_clinical_trials_tool()
        tools["study_design"] = self._create_study_design_tool()
        tools["endpoint_selection"] = self._create_endpoint_selector_tool()
        tools["drug_interaction"] = self._create_drug_interaction_tool()
        
        # Knowledge tools
        tools["rag_search"] = self._create_rag_search_tool()
        tools["knowledge_base"] = self._create_knowledge_base_tool()
        tools["agent_lookup"] = self._create_agent_lookup_tool()
        
        # Analysis tools
        tools["calculator"] = self._create_calculator_tool()
        tools["data_calculator"] = self._create_data_calculator_tool()
        tools["budget_calculator"] = self._create_budget_calculator_tool()
        
        return tools
    
    def _create_web_search_tool(self) -> Tool:
        """Create web search tool"""
        return Tool(
            name="web_search",
            description="Search the internet for current information, news, and research",
            func=self._web_search_func
        )
    
    def _create_pubmed_tool(self) -> Tool:
        """Create PubMed search tool"""
        return Tool(
            name="pubmed_search",
            description="Search PubMed/MEDLINE for medical literature and research papers",
            func=self._pubmed_search_func
        )
    
    def _create_fda_tool(self) -> Tool:
        """Create FDA database tool"""
        return Tool(
            name="fda_database",
            description="Search FDA database for drug approvals, devices, and adverse events",
            func=self._fda_search_func
        )
    
    def _create_clinical_trials_tool(self) -> Tool:
        """Create clinical trials tool"""
        return Tool(
            name="clinical_trials",
            description="Search ClinicalTrials.gov for clinical studies and trials",
            func=self._clinical_trials_func
        )
    
    def _create_rag_search_tool(self) -> Tool:
        """Create RAG search tool"""
        return Tool(
            name="rag_search",
            description="Search internal knowledge base across all 30 domains",
            func=self._rag_search_func
        )
    
    def _create_agent_lookup_tool(self) -> Tool:
        """Create agent lookup tool"""
        return Tool(
            name="agent_lookup",
            description="Find relevant agents from the agent store",
            func=self._agent_lookup_func
        )
    
    def _create_calculator_tool(self) -> Tool:
        """Create calculator tool"""
        return Tool(
            name="calculator",
            description="Perform mathematical calculations",
            func=self._calculator_func
        )
    
    # Tool function implementations
    async def _web_search_func(self, query: str) -> str:
        """Web search implementation"""
        # Mock implementation - integrate with actual web search API
        return f"Web search results for: {query}"
    
    async def _pubmed_search_func(self, query: str) -> str:
        """PubMed search implementation"""
        # Mock implementation - integrate with PubMed API
        return f"PubMed search results for: {query}"
    
    async def _fda_search_func(self, query: str) -> str:
        """FDA database search implementation"""
        # Mock implementation - integrate with FDA API
        return f"FDA database results for: {query}"
    
    async def _clinical_trials_func(self, query: str) -> str:
        """Clinical trials search implementation"""
        # Mock implementation - integrate with ClinicalTrials.gov API
        return f"Clinical trials results for: {query}"
    
    async def _rag_search_func(self, query: str) -> str:
        """RAG search implementation"""
        try:
            # Use the RAG connector to search all domains
            results = await self.rag.search_all_domains(query, top_k_per_domain=2)
            
            # Format results for tool output
            formatted_results = []
            for domain, docs in results.items():
                for doc in docs:
                    formatted_results.append({
                        'domain': domain,
                        'content': doc.get('content', ''),
                        'similarity': doc.get('similarity', 0),
                        'source': doc.get('source_name', 'Unknown')
                    })
            
            return f"RAG search found {len(formatted_results)} results across {len(results)} domains"
        except Exception as e:
            return f"RAG search error: {str(e)}"
    
    async def _agent_lookup_func(self, query: str) -> str:
        """Agent lookup implementation"""
        try:
            agents = await self.agent_store.get_agent_recommendations(query, max_agents=5)
            
            if not agents:
                return "No relevant agents found"
            
            agent_info = []
            for agent in agents:
                agent_info.append({
                    'name': agent.get('display_name', agent.get('name', 'Unknown')),
                    'description': agent.get('description', ''),
                    'domains': agent.get('knowledge_domains', []),
                    'tier': agent.get('tier', 1)
                })
            
            return f"Found {len(agents)} relevant agents: {agent_info}"
        except Exception as e:
            return f"Agent lookup error: {str(e)}"
    
    async def _calculator_func(self, expression: str) -> str:
        """Calculator implementation"""
        try:
            # Safe evaluation of mathematical expressions
            import ast
            import operator
            
            # Define safe operations
            safe_operators = {
                ast.Add: operator.add,
                ast.Sub: operator.sub,
                ast.Mult: operator.mul,
                ast.Div: operator.truediv,
                ast.Pow: operator.pow,
                ast.USub: operator.neg,
            }
            
            def safe_eval(node):
                if isinstance(node, ast.Expression):
                    return safe_eval(node.body)
                elif isinstance(node, ast.Constant):
                    return node.value
                elif isinstance(node, ast.BinOp):
                    left = safe_eval(node.left)
                    right = safe_eval(node.right)
                    return safe_operators[type(node.op)](left, right)
                elif isinstance(node, ast.UnaryOp):
                    operand = safe_eval(node.operand)
                    return safe_operators[type(node.op)](operand)
                else:
                    raise ValueError(f"Unsupported operation: {type(node)}")
            
            tree = ast.parse(expression, mode='eval')
            result = safe_eval(tree)
            return f"Result: {result}"
        except Exception as e:
            return f"Calculation error: {str(e)}"
    
    # Additional tool creation methods (simplified for brevity)
    def _create_cochrane_tool(self) -> Tool:
        return Tool(name="cochrane_reviews", description="Search Cochrane reviews", func=lambda x: f"Cochrane results: {x}")
    
    def _create_arxiv_tool(self) -> Tool:
        return Tool(name="arxiv_search", description="Search ArXiv papers", func=lambda x: f"ArXiv results: {x}")
    
    def _create_fda_guidance_tool(self) -> Tool:
        return Tool(name="fda_guidance", description="Search FDA guidance documents", func=lambda x: f"FDA guidance: {x}")
    
    def _create_ema_tool(self) -> Tool:
        return Tool(name="ema_database", description="Search EMA database", func=lambda x: f"EMA results: {x}")
    
    def _create_who_tool(self) -> Tool:
        return Tool(name="who_database", description="Search WHO databases", func=lambda x: f"WHO results: {x}")
    
    def _create_regulatory_calculator_tool(self) -> Tool:
        return Tool(name="regulatory_calculator", description="Regulatory cost/timeline calculator", func=lambda x: f"Regulatory calc: {x}")
    
    def _create_study_design_tool(self) -> Tool:
        return Tool(name="study_design", description="Clinical study design helper", func=lambda x: f"Study design: {x}")
    
    def _create_endpoint_selector_tool(self) -> Tool:
        return Tool(name="endpoint_selection", description="Clinical endpoint selector", func=lambda x: f"Endpoint selection: {x}")
    
    def _create_drug_interaction_tool(self) -> Tool:
        return Tool(name="drug_interaction", description="Drug interaction checker", func=lambda x: f"Drug interactions: {x}")
    
    def _create_knowledge_base_tool(self) -> Tool:
        return Tool(name="knowledge_base", description="Internal knowledge base search", func=lambda x: f"Knowledge base: {x}")
    
    def _create_data_calculator_tool(self) -> Tool:
        return Tool(name="data_calculator", description="Statistical analysis calculator", func=lambda x: f"Data analysis: {x}")
    
    def _create_budget_calculator_tool(self) -> Tool:
        return Tool(name="budget_calculator", description="Financial projections calculator", func=lambda x: f"Budget calc: {x}")
    
    def get_tool(self, tool_name: str) -> Tool:
        """Get a specific tool by name"""
        return self.tools.get(tool_name)
    
    def get_tools_by_category(self, category: str) -> List[Tool]:
        """Get tools by category"""
        if category == "research":
            return [self.tools[t] for t in self.RESEARCH_TOOLS if t in self.tools]
        elif category == "regulatory":
            return [self.tools[t] for t in self.REGULATORY_TOOLS if t in self.tools]
        elif category == "clinical":
            return [self.tools[t] for t in self.CLINICAL_TOOLS if t in self.tools]
        elif category == "knowledge":
            return [self.tools[t] for t in self.KNOWLEDGE_TOOLS if t in self.tools]
        elif category == "analysis":
            return [self.tools[t] for t in self.ANALYSIS_TOOLS if t in self.tools]
        else:
            return []
    
    def get_all_tools(self) -> List[Tool]:
        """Get all available tools"""
        return list(self.tools.values())
