"""
Panel Repository

Data access layer for panels using the tenant-aware database client.
Handles all CRUD operations and relationship loading.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
import structlog

from vital_shared_kernel.multi_tenant import TenantId

from services.tenant_aware_supabase import TenantAwareSupabaseClient
from domain.panel_types import PanelType, PanelStatus, ResponseType
from domain.panel_models import Panel, PanelResponse, PanelConsensus, PanelAggregate

logger = structlog.get_logger()


class PanelRepository:
    """
    Repository for panel domain entities.
    
    Handles:
    - Panel CRUD operations
    - Response management
    - Consensus storage
    - Aggregate loading
    - All operations are tenant-isolated
    """
    
    def __init__(self, db_client: TenantAwareSupabaseClient):
        """
        Initialize repository.
        
        Args:
            db_client: Tenant-aware database client
        """
        self.db = db_client
    
    async def create_panel(
        self,
        user_id: UUID,
        query: str,
        panel_type: PanelType,
        agents: List[str],
        configuration: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[TenantId] = None
    ) -> Panel:
        """
        Create a new panel.
        
        Args:
            user_id: User creating the panel
            query: Panel query/question
            panel_type: Type of panel
            agents: List of agent IDs to use
            configuration: Optional panel configuration
            metadata: Optional metadata
            tenant_id: Optional tenant override
            
        Returns:
            Created panel
        """
        now = datetime.now(timezone.utc)
        
        panel_data = {
            "user_id": str(user_id),
            "query": query,
            "panel_type": panel_type.value,
            "status": PanelStatus.CREATED.value,
            "configuration": configuration or {},
            "agents": agents,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "metadata": metadata or {}
        }
        
        record = await self.db.insert("panels", panel_data, tenant_id=tenant_id)
        
        logger.info(
            "panel_created",
            panel_id=record["id"],
            panel_type=panel_type.value,
            agents_count=len(agents)
        )
        
        return self._record_to_panel(record)
    
    async def get_panel(
        self,
        panel_id: UUID,
        tenant_id: Optional[TenantId] = None
    ) -> Optional[Panel]:
        """
        Get panel by ID.
        
        Args:
            panel_id: Panel ID
            tenant_id: Optional tenant override
            
        Returns:
            Panel or None if not found
        """
        record = await self.db.get_by_id("panels", str(panel_id), tenant_id=tenant_id)
        
        if not record:
            return None
        
        return self._record_to_panel(record)
    
    async def update_panel_status(
        self,
        panel_id: UUID,
        status: PanelStatus,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        tenant_id: Optional[TenantId] = None
    ) -> Panel:
        """
        Update panel status.
        
        Args:
            panel_id: Panel ID
            status: New status
            started_at: Optional start time
            completed_at: Optional completion time
            tenant_id: Optional tenant override
            
        Returns:
            Updated panel
        """
        update_data = {
            "status": status.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if started_at:
            update_data["started_at"] = started_at.isoformat()
        
        if completed_at:
            update_data["completed_at"] = completed_at.isoformat()
        
        record = await self.db.update("panels", str(panel_id), update_data, tenant_id=tenant_id)
        
        logger.info(
            "panel_status_updated",
            panel_id=str(panel_id),
            status=status.value
        )
        
        return self._record_to_panel(record)
    
    async def list_panels(
        self,
        status: Optional[PanelStatus] = None,
        panel_type: Optional[PanelType] = None,
        user_id: Optional[UUID] = None,
        limit: int = 50,
        tenant_id: Optional[TenantId] = None
    ) -> List[Panel]:
        """
        List panels with optional filters.
        
        Args:
            status: Filter by status
            panel_type: Filter by type
            user_id: Filter by user
            limit: Max results
            tenant_id: Optional tenant override
            
        Returns:
            List of panels
        """
        filters = {}
        
        if status:
            filters["status"] = status.value
        
        if panel_type:
            filters["panel_type"] = panel_type.value
        
        if user_id:
            filters["user_id"] = str(user_id)
        
        records = await self.db.list_all(
            "panels",
            filters=filters,
            limit=limit,
            order_by="created_at",
            tenant_id=tenant_id
        )
        
        return [self._record_to_panel(r) for r in records]
    
    async def add_response(
        self,
        panel_id: UUID,
        agent_id: str,
        agent_name: str,
        round_number: int,
        response_type: ResponseType,
        content: str,
        confidence_score: float,
        metadata: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[TenantId] = None
    ) -> PanelResponse:
        """
        Add response to panel.
        
        Args:
            panel_id: Panel ID
            agent_id: Agent identifier
            agent_name: Agent display name
            round_number: Discussion round number
            response_type: Type of response
            content: Response content
            confidence_score: Confidence (0-1)
            metadata: Optional metadata
            tenant_id: Optional tenant override
            
        Returns:
            Created response
        """
        response_data = {
            "panel_id": str(panel_id),
            "agent_id": agent_id,
            "agent_name": agent_name,
            "round_number": round_number,
            "response_type": response_type.value,
            "content": content,
            "confidence_score": confidence_score,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }
        
        record = await self.db.insert("panel_responses", response_data, tenant_id=tenant_id)
        
        logger.info(
            "panel_response_added",
            panel_id=str(panel_id),
            agent_id=agent_id,
            round_number=round_number
        )
        
        return self._record_to_response(record)
    
    async def get_panel_responses(
        self,
        panel_id: UUID,
        round_number: Optional[int] = None,
        tenant_id: Optional[TenantId] = None
    ) -> List[PanelResponse]:
        """
        Get responses for a panel.
        
        Args:
            panel_id: Panel ID
            round_number: Optional filter by round
            tenant_id: Optional tenant override
            
        Returns:
            List of responses
        """
        filters = {"panel_id": str(panel_id)}
        
        if round_number is not None:
            filters["round_number"] = round_number
        
        records = await self.db.list_all(
            "panel_responses",
            filters=filters,
            order_by="created_at",
            tenant_id=tenant_id
        )
        
        return [self._record_to_response(r) for r in records]
    
    async def save_consensus(
        self,
        panel_id: UUID,
        round_number: int,
        consensus_level: float,
        agreement_points: Dict[str, Any],
        disagreement_points: Dict[str, Any],
        recommendation: str,
        dissenting_opinions: Dict[str, Any],
        tenant_id: Optional[TenantId] = None
    ) -> PanelConsensus:
        """
        Save consensus for panel.
        
        Args:
            panel_id: Panel ID
            round_number: Discussion round
            consensus_level: Consensus level (0-1)
            agreement_points: Points of agreement
            disagreement_points: Points of disagreement
            recommendation: Final recommendation
            dissenting_opinions: Dissenting views
            tenant_id: Optional tenant override
            
        Returns:
            Created consensus
        """
        consensus_data = {
            "panel_id": str(panel_id),
            "round_number": round_number,
            "consensus_level": consensus_level,
            "agreement_points": agreement_points,
            "disagreement_points": disagreement_points,
            "recommendation": recommendation,
            "dissenting_opinions": dissenting_opinions,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        record = await self.db.insert("panel_consensus", consensus_data, tenant_id=tenant_id)
        
        logger.info(
            "panel_consensus_saved",
            panel_id=str(panel_id),
            consensus_level=consensus_level,
            round_number=round_number
        )
        
        return self._record_to_consensus(record)
    
    async def get_panel_consensus(
        self,
        panel_id: UUID,
        round_number: Optional[int] = None,
        tenant_id: Optional[TenantId] = None
    ) -> Optional[PanelConsensus]:
        """
        Get consensus for panel.
        
        Args:
            panel_id: Panel ID
            round_number: Optional specific round
            tenant_id: Optional tenant override
            
        Returns:
            Consensus or None
        """
        filters = {"panel_id": str(panel_id)}
        
        if round_number is not None:
            filters["round_number"] = round_number
        
        records = await self.db.list_all(
            "panel_consensus",
            filters=filters,
            order_by="created_at",
            limit=1,
            tenant_id=tenant_id
        )
        
        if not records:
            return None
        
        return self._record_to_consensus(records[0])
    
    async def get_panel_aggregate(
        self,
        panel_id: UUID,
        tenant_id: Optional[TenantId] = None
    ) -> Optional[PanelAggregate]:
        """
        Get complete panel aggregate with responses and consensus.
        
        Args:
            panel_id: Panel ID
            tenant_id: Optional tenant override
            
        Returns:
            Panel aggregate or None
        """
        # Load panel
        panel = await self.get_panel(panel_id, tenant_id=tenant_id)
        if not panel:
            return None
        
        # Load responses
        responses = await self.get_panel_responses(panel_id, tenant_id=tenant_id)
        
        # Load consensus
        consensus = await self.get_panel_consensus(panel_id, tenant_id=tenant_id)
        
        # Build aggregate
        aggregate = PanelAggregate(panel=panel, responses=responses, consensus=consensus)
        
        return aggregate
    
    def _record_to_panel(self, record: Dict[str, Any]) -> Panel:
        """Convert database record to Panel entity"""
        return Panel(
            id=UUID(record["id"]),
            tenant_id=UUID(record["tenant_id"]),
            user_id=UUID(record["user_id"]),
            query=record["query"],
            panel_type=PanelType(record["panel_type"]),
            status=PanelStatus(record["status"]),
            configuration=record.get("configuration", {}),
            agents=record.get("agents", []),
            created_at=datetime.fromisoformat(record["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(record["updated_at"].replace("Z", "+00:00")),
            started_at=datetime.fromisoformat(record["started_at"].replace("Z", "+00:00")) if record.get("started_at") else None,
            completed_at=datetime.fromisoformat(record["completed_at"].replace("Z", "+00:00")) if record.get("completed_at") else None,
            metadata=record.get("metadata", {})
        )
    
    def _record_to_response(self, record: Dict[str, Any]) -> PanelResponse:
        """Convert database record to PanelResponse entity"""
        return PanelResponse(
            id=UUID(record["id"]),
            tenant_id=UUID(record["tenant_id"]),
            panel_id=UUID(record["panel_id"]),
            agent_id=record["agent_id"],
            agent_name=record["agent_name"],
            round_number=record["round_number"],
            response_type=ResponseType(record["response_type"]),
            content=record["content"],
            confidence_score=float(record["confidence_score"]),
            created_at=datetime.fromisoformat(record["created_at"].replace("Z", "+00:00")),
            metadata=record.get("metadata", {})
        )
    
    def _record_to_consensus(self, record: Dict[str, Any]) -> PanelConsensus:
        """Convert database record to PanelConsensus entity"""
        return PanelConsensus(
            id=UUID(record["id"]),
            tenant_id=UUID(record["tenant_id"]),
            panel_id=UUID(record["panel_id"]),
            round_number=record["round_number"],
            consensus_level=float(record["consensus_level"]),
            agreement_points=record.get("agreement_points", {}),
            disagreement_points=record.get("disagreement_points", {}),
            recommendation=record["recommendation"],
            dissenting_opinions=record.get("dissenting_opinions", {}),
            created_at=datetime.fromisoformat(record["created_at"].replace("Z", "+00:00"))
        )


# Factory function
def create_panel_repository(db_client: TenantAwareSupabaseClient) -> PanelRepository:
    """
    Create a panel repository.
    
    Args:
        db_client: Tenant-aware database client
        
    Returns:
        PanelRepository instance
    """
    return PanelRepository(db_client)

