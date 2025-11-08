"""
Agent Service Interface

Defines the contract for agent operations across all VITAL services.
All agent service implementations must implement this interface.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime


class IAgentService(ABC):
    """
    Interface for agent operations.
    
    All modes (1, 2, 3, 4) use this interface for consistent agent handling.
    
    Benefits:
    - Easy to swap implementations (e.g., add Redis caching)
    - Easy to mock for testing
    - Clear contract for all services
    - Type-safe operations
    """
    
    @abstractmethod
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
            Agent profile with all metadata
            
        Raises:
            AgentNotFoundError: If agent doesn't exist
            AccessDeniedError: If tenant can't access agent
        """
        pass
    
    @abstractmethod
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
        3. User must have permission (via RLS)
        
        Args:
            agent_id: Agent to check
            user_id: User requesting access
            tenant_id: User's tenant
            
        Returns:
            True if access allowed, False otherwise
        """
        pass
    
    @abstractmethod
    async def track_usage(
        self,
        agent_id: str,
        session_id: str,
        metrics: Dict[str, Any]
    ) -> None:
        """
        Track agent usage for analytics.
        
        Metrics should include:
        - tokens_used: Total tokens consumed
        - cost_usd: Cost in USD
        - response_time_ms: Response time in milliseconds
        - status: "success" or "error"
        
        Args:
            agent_id: Agent being tracked
            session_id: Session identifier
            metrics: Usage metrics dictionary
        """
        pass
    
    @abstractmethod
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
        pass
    
    @abstractmethod
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
        pass
    
    @abstractmethod
    async def update_agent_stats(
        self,
        agent_id: str,
        stat_type: str,
        value: float
    ) -> None:
        """
        Update agent statistics (success rate, avg response time, etc.).
        
        Args:
            agent_id: Agent to update
            stat_type: Type of statistic (e.g., "success_rate", "avg_response_time")
            value: New value
        """
        pass

