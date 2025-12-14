"""
Agent Service - Simple wrapper for agent loading operations

This service provides a simple interface for loading agents by IDs,
used by the Ask Panel Enhanced workflow.

It wraps UnifiedAgentLoader for consistency with other services.
"""

from typing import List, Dict, Any, Optional
from supabase import Client as SupabaseClient
import structlog

from services.unified_agent_loader import UnifiedAgentLoader, AgentProfile

logger = structlog.get_logger()


class AgentService:
    """
    Simple agent service for loading agents by IDs.
    
    This is a lightweight wrapper around UnifiedAgentLoader that provides
    the get_agents_by_ids() method expected by the Ask Panel Enhanced workflow.
    """

    def __init__(self, supabase_client: SupabaseClient):
        """
        Initialize agent service.
        
        Args:
            supabase_client: Supabase client instance
        """
        self.supabase = supabase_client
        self.loader = UnifiedAgentLoader(supabase_client)

    async def get_agents_by_ids(
        self,
        agent_ids: List[str],
        tenant_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Load multiple agents by their IDs.
        
        Args:
            agent_ids: List of agent UUIDs
            tenant_id: Optional tenant ID for isolation
            
        Returns:
            List of agent dictionaries with agent data
        """
        agents = []
        
        for agent_id in agent_ids:
            try:
                # Use UnifiedAgentLoader to load agent
                # If tenant_id not provided, try to get from context or use platform
                effective_tenant_id = tenant_id or "platform"
                
                agent_profile = await self.loader.load_agent_by_id(
                    agent_id=agent_id,
                    tenant_id=effective_tenant_id
                )
                
                # Convert AgentProfile to dict format expected by workflow
                agent_dict = {
                    "id": agent_profile.id,
                    "name": agent_profile.name,
                    "display_name": agent_profile.display_name,
                    "description": agent_profile.description,
                    "system_prompt": agent_profile.system_prompt,
                    "is_active": True,  # UnifiedAgentLoader only returns active agents
                    "model": agent_profile.model,
                    "temperature": agent_profile.temperature,
                    "max_tokens": agent_profile.max_tokens,
                }
                
                agents.append(agent_dict)
                logger.debug(f"Loaded agent: {agent_profile.name} ({agent_id})")
                
            except Exception as e:
                logger.warning(
                    f"Failed to load agent {agent_id}: {e}",
                    agent_id=agent_id,
                    error=str(e)
                )
                # Continue loading other agents even if one fails
        
        logger.info(f"Loaded {len(agents)}/{len(agent_ids)} agents")
        return agents
