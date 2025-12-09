"""
VITAL Path AI Services - VITAL L4 Context Engineer

L4 Worker that prepares evidence and context using L5 tools.
Orchestrates L5 tool calls for evidence gathering.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: AskExpertL4ContextEngineer
- Methods: gather_evidence, determine_tool_calls
- Logs: vital_l4_context_{action}
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import structlog

# Import dynamic LLM config
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()

# Get L4 defaults from environment variables
_L4_DEFAULTS = get_llm_config_for_level("L4")


class AskExpertL4ContextEngineer:
    """
    L4 Context Worker - Prepares evidence and context.
    
    Responsibilities:
    - Orchestrate L5 tool calls
    - Gather evidence from multiple sources
    - Prepare context for L2/L3 agents
    - Optimize for cost (uses Haiku)
    
    This is the ONLY layer that directly calls L5 tools.
    """
    
    def __init__(
        self,
        l5_tools: Optional[Dict[str, Any]] = None,
        llm=None,
        model: Optional[str] = None,
        token_budget: Optional[int] = None,
    ):
        """
        Initialize L4 Context Engineer.

        Args:
            l5_tools: Dictionary of L5 tool instances
            llm: Pre-configured LLM
            model: Model to use (defaults to L4_LLM_MODEL env var)
            token_budget: Maximum tokens (defaults to L4_LLM_MAX_TOKENS env var)
        """
        self.tools = l5_tools or {}
        # Use dynamic defaults from environment variables
        self.model = model or _L4_DEFAULTS.model
        self.token_budget = token_budget or _L4_DEFAULTS.max_tokens
        self.temperature = _L4_DEFAULTS.temperature

        if llm:
            self.llm = llm
        else:
            try:
                from langchain_anthropic import ChatAnthropic
                self.llm = ChatAnthropic(
                    model=self.model,
                    temperature=self.temperature,
                    max_tokens=self.token_budget,
                )
            except ImportError:
                self.llm = None

        logger.info(
            "vital_l4_context_engineer_initialized",
            available_tools=list(self.tools.keys()),
            model=self.model,
            config_source=_L4_DEFAULTS.source,
        )
    
    async def gather_evidence(
        self,
        query: str,
        required_sources: List[str],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Gather evidence from L5 tools.
        
        Args:
            query: The query to gather evidence for
            required_sources: List of L5 tools to use
            tenant_id: Tenant UUID
            
        Returns:
            Structured evidence from all sources
        """
        logger.info(
            "vital_l4_gather_evidence_started",
            tenant_id=tenant_id,
            required_sources=required_sources,
        )
        
        evidence = {
            'query': query,
            'sources': {},
            'errors': [],
            'timestamp': datetime.utcnow().isoformat(),
        }
        
        try:
            # Determine which tools to call and with what params
            tool_calls = await self._determine_tool_calls(query, required_sources)
            
            # Execute tool calls in parallel
            results = await self._execute_tool_calls(tool_calls, tenant_id)
            
            evidence['sources'] = results
            evidence['tools_used'] = list(results.keys())
            evidence['success'] = len(evidence['errors']) == 0
            
            logger.info(
                "vital_l4_gather_evidence_completed",
                tenant_id=tenant_id,
                sources_gathered=len(results),
            )
            
        except Exception as e:
            logger.error(
                "vital_l4_gather_evidence_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            evidence['errors'].append(str(e))
            evidence['success'] = False
        
        return evidence
    
    async def _determine_tool_calls(
        self,
        query: str,
        available_tools: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Determine which tools to call and with what parameters.
        
        Uses LLM to intelligently determine tool parameters.
        """
        # Filter to only available tools
        tools_to_use = [t for t in available_tools if t in self.tools]
        
        if not tools_to_use:
            # Default to all available tools
            tools_to_use = list(self.tools.keys())
        
        # For each tool, determine parameters
        tool_calls = []
        
        for tool_name in tools_to_use:
            # Simple parameter extraction for now
            # Can be enhanced with LLM-based parameter determination
            params = self._extract_parameters(query, tool_name)
            
            tool_calls.append({
                'tool': tool_name,
                'params': params,
            })
        
        return tool_calls
    
    def _extract_parameters(self, query: str, tool_name: str) -> Dict[str, Any]:
        """Extract tool-specific parameters from query."""
        params = {'query': query}
        
        # Tool-specific parameter extraction
        if tool_name == 'fda_labels':
            # Try to extract drug name
            params['search_type'] = 'drug'
        elif tool_name == 'clinical_trials':
            params['status'] = ['RECRUITING', 'ACTIVE_NOT_RECRUITING']
        elif tool_name == 'pubmed':
            params['max_results'] = 10
        elif tool_name == 'rag':
            params['top_k'] = 10
        
        return params
    
    async def _execute_tool_calls(
        self,
        tool_calls: List[Dict[str, Any]],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Execute tool calls in parallel where possible.
        """
        results = {}
        
        # Create async tasks for each tool
        tasks = []
        tool_names = []
        
        for call in tool_calls:
            tool_name = call['tool']
            tool = self.tools.get(tool_name)
            
            if tool:
                tasks.append(
                    self._safe_tool_call(tool, call['params'], tenant_id)
                )
                tool_names.append(tool_name)
        
        if not tasks:
            return results
        
        # Execute all tools in parallel
        try:
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            for name, response in zip(tool_names, responses):
                if isinstance(response, Exception):
                    logger.error(
                        f"vital_l4_tool_{name}_failed",
                        error=str(response),
                    )
                    results[name] = {'error': str(response)}
                else:
                    results[name] = response
                    
        except Exception as e:
            logger.error(
                "vital_l4_parallel_execution_failed",
                error=str(e),
            )
        
        return results
    
    async def _safe_tool_call(
        self,
        tool: Any,
        params: Dict[str, Any],
        tenant_id: str,
    ) -> Any:
        """Safely execute a single tool call."""
        try:
            # Tools should implement either search() or execute()
            if hasattr(tool, 'search'):
                return await tool.search(**params)
            elif hasattr(tool, 'execute'):
                return await tool.execute(params, tenant_id=tenant_id)
            elif callable(tool):
                return await tool(**params)
            else:
                return {'error': 'Tool not callable'}
        except Exception as e:
            return {'error': str(e)}
    
    def register_tool(self, name: str, tool: Any) -> None:
        """Register an L5 tool."""
        self.tools[name] = tool
        logger.info(
            "vital_l4_tool_registered",
            tool_name=name,
        )
