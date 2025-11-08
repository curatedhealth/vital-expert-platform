"""
Agent Service Implementation

Implements IAgentService for agent management operations.
Provides agent loading, access control, and usage tracking.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog

from vital_shared.interfaces.agent_service import IAgentService
from vital_shared.models.agent import AgentProfile, AgentStatus, AgentRole, AgentCapability
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class AgentService(IAgentService):
    """
    Production implementation of IAgentService.
    
    Manages agents stored in Supabase with full RLS support.
    
    Usage:
        >>> service = AgentService(supabase_client)
        >>> agent = await service.load_agent("agent-123", "tenant-456")
        >>> has_access = await service.validate_access("agent-123", "user-789", "tenant-456")
    """
    
    def __init__(self, db_client: SupabaseClient):
        """
        Initialize service.
        
        Args:
            db_client: Supabase client for database operations
        """
        self.db = db_client
        self.logger = logger.bind(service="AgentService")
    
    async def load_agent(
        self, 
        agent_id: str, 
        tenant_id: str
    ) -> Dict[str, Any]:
        """
        Load agent profile from database.
        
        Args:
            agent_id: Unique agent identifier
            tenant_id: Tenant identifier for multi-tenancy
            
        Returns:
            Agent profile dictionary
            
        Raises:
            ValueError: If agent doesn't exist
            PermissionError: If tenant can't access agent
        """
        try:
            self.logger.info(
                "loading_agent",
                agent_id=agent_id,
                tenant_id=tenant_id
            )
            
            # Query agent with RLS (Row Level Security)
            result = self.db.client.table("agents").select("*").eq("id", agent_id).eq("tenant_id", tenant_id).execute()
            
            if not result.data or len(result.data) == 0:
                raise ValueError(f"Agent {agent_id} not found for tenant {tenant_id}")
            
            agent_data = result.data[0]
            
            # Convert to standardized format
            agent = {
                "id": agent_data["id"],
                "name": agent_data["name"],
                "display_name": agent_data.get("display_name", agent_data["name"]),
                "avatar_url": agent_data.get("avatar_url"),
                "role": agent_data.get("role", "expert"),
                "status": agent_data.get("status", "active"),
                "capabilities": agent_data.get("capabilities", []),
                "supported_modes": agent_data.get("supported_modes", [1]),
                "domain_ids": agent_data.get("domain_ids", []),
                "expertise_areas": agent_data.get("expertise_areas", []),
                "system_prompt": agent_data.get("system_prompt", ""),
                "temperature": agent_data.get("temperature", 0.7),
                "max_tokens": agent_data.get("max_tokens", 4000),
                "model": agent_data.get("model", "gpt-4-turbo-preview"),
                "tenant_id": agent_data["tenant_id"],
                "created_by": agent_data["created_by"],
                "is_public": agent_data.get("is_public", False),
                "allowed_users": agent_data.get("allowed_users", []),
                "created_at": agent_data["created_at"],
                "updated_at": agent_data["updated_at"],
                "metadata": agent_data.get("metadata", {})
            }
            
            self.logger.info(
                "agent_loaded",
                agent_id=agent_id,
                agent_name=agent["name"]
            )
            
            return agent
            
        except ValueError:
            raise
        except Exception as e:
            self.logger.error(
                "agent_load_failed",
                agent_id=agent_id,
                tenant_id=tenant_id,
                error=str(e)
            )
            raise RuntimeError(f"Failed to load agent: {str(e)}")
    
    async def validate_access(
        self, 
        agent_id: str, 
        user_id: str, 
        tenant_id: str
    ) -> bool:
        """
        Check if user can access agent.
        
        Rules:
        1. Agent must belong to user's tenant
        2. Agent must be active
        3. User must have permission (public or in allowed_users or owner)
        
        Args:
            agent_id: Agent to check
            user_id: User requesting access
            tenant_id: User's tenant
            
        Returns:
            True if access allowed, False otherwise
        """
        try:
            self.logger.info(
                "validating_access",
                agent_id=agent_id,
                user_id=user_id,
                tenant_id=tenant_id
            )
            
            # Load agent
            agent = await self.load_agent(agent_id, tenant_id)
            
            # Check if agent is active
            if agent.get("status") != "active":
                self.logger.warning(
                    "access_denied_inactive",
                    agent_id=agent_id,
                    status=agent.get("status")
                )
                return False
            
            # Check access rules
            is_public = agent.get("is_public", False)
            is_owner = agent.get("created_by") == user_id
            in_allowed_users = user_id in agent.get("allowed_users", [])
            
            has_access = is_public or is_owner or in_allowed_users
            
            self.logger.info(
                "access_validated",
                agent_id=agent_id,
                user_id=user_id,
                has_access=has_access,
                reason="public" if is_public else ("owner" if is_owner else ("allowed" if in_allowed_users else "denied"))
            )
            
            return has_access
            
        except ValueError:
            # Agent doesn't exist
            return False
        except Exception as e:
            self.logger.error(
                "access_validation_failed",
                agent_id=agent_id,
                user_id=user_id,
                error=str(e)
            )
            return False
    
    async def track_usage(
        self,
        agent_id: str,
        session_id: str,
        metrics: Dict[str, Any]
    ) -> None:
        """
        Track agent usage for analytics.
        
        Args:
            agent_id: Agent being tracked
            session_id: Session identifier
            metrics: Usage metrics (tokens_used, cost_usd, response_time_ms, status)
        """
        try:
            self.logger.info(
                "tracking_usage",
                agent_id=agent_id,
                session_id=session_id,
                metrics=metrics
            )
            
            # Insert usage record
            usage_record = {
                "agent_id": agent_id,
                "session_id": session_id,
                "tokens_used": metrics.get("tokens_used", 0),
                "cost_usd": metrics.get("cost_usd", 0.0),
                "response_time_ms": metrics.get("response_time_ms", 0.0),
                "status": metrics.get("status", "success"),
                "created_at": datetime.now().isoformat(),
                "metadata": metrics.get("metadata", {})
            }
            
            self.db.client.table("agent_usage").insert(usage_record).execute()
            
            # Update agent statistics (aggregate)
            await self._update_agent_statistics(agent_id, metrics)
            
            self.logger.info(
                "usage_tracked",
                agent_id=agent_id,
                session_id=session_id
            )
            
        except Exception as e:
            # Don't fail the request if tracking fails
            self.logger.error(
                "usage_tracking_failed",
                agent_id=agent_id,
                session_id=session_id,
                error=str(e)
            )
    
    async def get_agent_tools(
        self,
        agent_id: str,
        tenant_id: str
    ) -> list[str]:
        """
        Get list of tools available to agent.
        
        Args:
            agent_id: Agent identifier
            tenant_id: Tenant identifier
            
        Returns:
            List of tool names agent can use
        """
        try:
            agent = await self.load_agent(agent_id, tenant_id)
            capabilities = agent.get("capabilities", [])
            
            # Map capabilities to tool names
            tool_mapping = {
                "web_search": "web_search",
                "pubmed_search": "pubmed_search",
                "fda_database": "fda_database",
                "calculator": "calculator",
                "code_generation": "code_generator",
                "document_generation": "document_generator",
                "diagram_generation": "diagram_generator"
            }
            
            tools = [tool_mapping.get(cap, cap) for cap in capabilities if cap in tool_mapping]
            
            self.logger.info(
                "agent_tools_retrieved",
                agent_id=agent_id,
                tools=tools
            )
            
            return tools
            
        except Exception as e:
            self.logger.error(
                "get_tools_failed",
                agent_id=agent_id,
                error=str(e)
            )
            return []
    
    async def get_agent_domains(
        self,
        agent_id: str,
        tenant_id: str
    ) -> list[str]:
        """
        Get knowledge domains agent has access to.
        
        Args:
            agent_id: Agent identifier
            tenant_id: Tenant identifier
            
        Returns:
            List of domain IDs for RAG queries
        """
        try:
            agent = await self.load_agent(agent_id, tenant_id)
            domain_ids = agent.get("domain_ids", [])
            
            self.logger.info(
                "agent_domains_retrieved",
                agent_id=agent_id,
                domains=domain_ids
            )
            
            return domain_ids
            
        except Exception as e:
            self.logger.error(
                "get_domains_failed",
                agent_id=agent_id,
                error=str(e)
            )
            return []
    
    async def update_agent_stats(
        self,
        agent_id: str,
        stat_type: str,
        value: float
    ) -> None:
        """
        Update agent statistics.
        
        Args:
            agent_id: Agent to update
            stat_type: Type of statistic (e.g., "success_rate", "avg_response_time")
            value: New value
        """
        try:
            self.logger.info(
                "updating_agent_stats",
                agent_id=agent_id,
                stat_type=stat_type,
                value=value
            )
            
            # Update agent record
            update_data = {
                f"stats_{stat_type}": value,
                "updated_at": datetime.now().isoformat()
            }
            
            self.db.client.table("agents").update(update_data).eq("id", agent_id).execute()
            
            self.logger.info(
                "agent_stats_updated",
                agent_id=agent_id,
                stat_type=stat_type
            )
            
        except Exception as e:
            self.logger.error(
                "update_stats_failed",
                agent_id=agent_id,
                error=str(e)
            )
    
    async def _update_agent_statistics(
        self,
        agent_id: str,
        metrics: Dict[str, Any]
    ) -> None:
        """
        Update aggregate agent statistics.
        
        Args:
            agent_id: Agent to update
            metrics: Usage metrics
        """
        try:
            # Get current stats
            result = self.db.client.table("agents").select("total_conversations, total_messages, total_tokens_used, total_cost_usd, avg_response_time_ms, success_rate").eq("id", agent_id).execute()
            
            if not result.data:
                return
            
            current = result.data[0]
            
            # Calculate new stats
            total_conversations = current.get("total_conversations", 0)
            total_messages = current.get("total_messages", 0) + 1
            total_tokens = current.get("total_tokens_used", 0) + metrics.get("tokens_used", 0)
            total_cost = current.get("total_cost_usd", 0.0) + metrics.get("cost_usd", 0.0)
            
            # Running average for response time
            avg_response_time = current.get("avg_response_time_ms", 0.0)
            new_response_time = metrics.get("response_time_ms", 0.0)
            if total_messages > 1:
                avg_response_time = ((avg_response_time * (total_messages - 1)) + new_response_time) / total_messages
            else:
                avg_response_time = new_response_time
            
            # Success rate
            success_count = current.get("successful_messages", 0)
            if metrics.get("status") == "success":
                success_count += 1
            success_rate = success_count / total_messages if total_messages > 0 else 0.0
            
            # Update
            update_data = {
                "total_messages": total_messages,
                "total_tokens_used": total_tokens,
                "total_cost_usd": total_cost,
                "avg_response_time_ms": avg_response_time,
                "success_rate": success_rate,
                "successful_messages": success_count,
                "updated_at": datetime.now().isoformat(),
                "last_used_at": datetime.now().isoformat()
            }
            
            self.db.client.table("agents").update(update_data).eq("id", agent_id).execute()
            
        except Exception as e:
            self.logger.error(
                "update_statistics_failed",
                agent_id=agent_id,
                error=str(e)
            )

