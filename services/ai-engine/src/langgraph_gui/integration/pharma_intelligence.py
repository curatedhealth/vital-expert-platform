"""
Integration between workflow engine and Pharma Intelligence system
Adapts existing agents/tools to work as workflow nodes
"""

import os
import sys
from typing import Dict, Any
from pathlib import Path

# Import pharma_intelligence from backend
# No need to modify sys.path since it's now in the same package

from ..nodes.base import NodeConfig, NodeType


class PharmaIntelligenceIntegration:
    """Bridge between workflow nodes and Pharma Intelligence agents/tools"""
    
    def __init__(self):
        """Initialize integration with lazy loading"""
        self._orchestrator = None
        self._tools = None
        self._initialized = False
    
    def _init_system(self):
        """Lazy initialize Pharma Intelligence system"""
        if self._initialized:
            return
        
        try:
            from langgraph_gui.pharma_intelligence.orchestrator import EnhancedPharmaIntelligenceOrchestrator
            from langgraph_gui.pharma_intelligence.tools import (
                PubMedSearchTool,
                WebSearchTool,
                ArXivSearchTool,
                ClinicalTrialsSearchTool,
                FDASearchTool,
                ScraperTool
            )
            
            # Initialize orchestrator
            self._orchestrator = EnhancedPharmaIntelligenceOrchestrator(
                openai_api_key=os.getenv('OPENAI_API_KEY'),
                pinecone_api_key=os.getenv('PINECONE_API_KEY'),
                pinecone_index_name=os.getenv('PINECONE_INDEX_NAME', 'pharma-intelligence'),
                max_iterations=2
            )
            
            # Initialize tools directly
            self._tools = {
                'pubmed': PubMedSearchTool(),
                'web': WebSearchTool(),
                'arxiv': ArXivSearchTool(),
                'clinical_trials': ClinicalTrialsSearchTool(),
                'fda': FDASearchTool(),
                'scraper': ScraperTool()
            }
            
            self._initialized = True
            
        except Exception as e:
            print(f"Warning: Could not initialize Pharma Intelligence: {e}")
            print("Workflow execution will use mock data")
    
    async def execute_node(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a workflow node using Pharma Intelligence
        
        Args:
            node: Node configuration
            inputs: Input data
            
        Returns:
            Node output data
        """
        self._init_system()
        
        # If not initialized, return mock data
        if not self._initialized:
            return self._mock_execution(node, inputs)
        
        try:
            # Route to appropriate handler based on node type
            if node.type in [NodeType.MEDICAL, NodeType.DIGITAL_HEALTH, NodeType.REGULATORY]:
                return await self._execute_agent(node, inputs)
            
            elif node.type in [NodeType.PUBMED, NodeType.ARXIV, NodeType.CLINICAL_TRIALS, NodeType.FDA, NodeType.WEB_SEARCH, NodeType.SCRAPER]:
                return await self._execute_tool(node, inputs)
            
            elif node.type == NodeType.RAG_SEARCH:
                return await self._execute_rag_search(node, inputs)
            
            elif node.type == NodeType.RAG_ARCHIVE:
                return await self._execute_rag_archive(node, inputs)
            
            elif node.type == NodeType.CACHE_LOOKUP:
                return await self._execute_cache_lookup(node, inputs)
            
            elif node.type == NodeType.INPUT:
                return inputs
            
            elif node.type == NodeType.OUTPUT:
                return {"result": inputs}
            
            elif node.type == NodeType.MERGE:
                return {"merged": inputs}
            
            else:
                # Default: pass through
                return inputs
                
        except Exception as e:
            print(f"Error executing node {node.id}: {e}")
            return {"error": str(e)}
    
    async def _execute_agent(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an agent node"""
        query = inputs.get('query', inputs.get('input', ''))
        
        if not query:
            return {"error": "No query provided"}
        
        # Get agent type
        agent_type = node.type.value  # "medical_agent", "digital_health_agent", etc.
        
        # For now, use the full orchestrator research
        # In a more granular implementation, you'd call individual agents
        try:
            # Use the specific agent from orchestrator
            if node.type == NodeType.MEDICAL:
                agent = self._orchestrator.medical_agent
            elif node.type == NodeType.DIGITAL_HEALTH:
                agent = self._orchestrator.digital_health_agent
            elif node.type == NodeType.REGULATORY:
                agent = self._orchestrator.regulatory_agent
            else:
                return {"error": f"Unknown agent type: {agent_type}"}
            
            # Execute agent (simplified - in real implementation, call agent.research())
            result = f"Results from {node.label} for query: {query}"
            
            return {
                "findings": result,
                "sources": ["Source 1", "Source 2"],
                "confidence_score": 0.85
            }
            
        except Exception as e:
            return {"error": f"Agent execution failed: {str(e)}"}
    
    async def _execute_tool(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool node"""
        query = inputs.get('query', inputs.get('input', ''))
        
        if not query:
            return {"error": "No query provided"}
        
        # Map node type to tool
        tool_map = {
            NodeType.PUBMED: 'pubmed',
            NodeType.ARXIV: 'arxiv',
            NodeType.CLINICAL_TRIALS: 'clinical_trials',
            NodeType.FDA: 'fda',
            NodeType.WEB_SEARCH: 'web',
            NodeType.SCRAPER: 'scraper'
        }
        
        tool_key = tool_map.get(node.type)
        if not tool_key or tool_key not in self._tools:
            return {"error": f"Unknown tool: {node.type}"}
        
        tool = self._tools[tool_key]
        
        try:
            # Execute tool
            if node.type == NodeType.SCRAPER:
                # Scraper expects URLs
                urls = inputs.get('urls', [query])
                result = tool.run(urls)
            else:
                # Other tools expect query
                max_results = node.parameters.get('max_results', 10)
                result = tool.run(query, max_results=max_results)
            
            return {"results": result}
            
        except Exception as e:
            return {"error": f"Tool execution failed: {str(e)}"}
    
    async def _execute_rag_search(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute RAG search"""
        query = inputs.get('query', inputs.get('input', ''))
        
        if not query:
            return {"error": "No query provided"}
        
        try:
            top_k = node.parameters.get('top_k', 5)
            results = self._orchestrator.rag_manager.search(query, top_k=top_k)
            return {"results": results}
        except Exception as e:
            return {"error": f"RAG search failed: {str(e)}"}
    
    async def _execute_rag_archive(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute RAG archive"""
        data = inputs.get('data', '')
        metadata = inputs.get('metadata', {})
        
        if not data:
            return {"error": "No data provided"}
        
        try:
            self._orchestrator.rag_manager.archive_research(data, metadata)
            return {"status": "archived"}
        except Exception as e:
            return {"error": f"RAG archive failed: {str(e)}"}
    
    async def _execute_cache_lookup(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute cache lookup"""
        query = inputs.get('query', inputs.get('input', ''))
        
        if not query:
            return {"error": "No query provided"}
        
        try:
            cached = self._orchestrator.query_cache.get(query)
            
            return {
                "cached_result": cached,
                "cache_hit": cached is not None
            }
        except Exception as e:
            return {"error": f"Cache lookup failed: {str(e)}"}
    
    def _mock_execution(self, node: NodeConfig, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Mock execution when system not initialized"""
        return {
            "mock": True,
            "node_type": node.type.value,
            "inputs": inputs,
            "message": "Mock execution (Pharma Intelligence not initialized)"
        }

