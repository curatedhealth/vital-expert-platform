"""
Base classes for ontology layer services.

This module provides the foundational abstractions for all 8 ontology layers:
- OntologyLayerService: Base class for layer-specific services
- OntologyContext: Data class for resolved ontology context
"""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
from pydantic import BaseModel


T = TypeVar("T", bound=BaseModel)


@dataclass
class OntologyContext:
    """
    Full ontology context resolved across all 8 layers.

    This is the primary output of the OntologyResolver, containing
    contextual information from each layer relevant to a query.
    """

    # L0: Domain Knowledge
    therapeutic_area: Optional[Dict[str, Any]] = None
    evidence_types: List[str] = field(default_factory=list)
    rag_namespaces: List[str] = field(default_factory=list)
    jurisdiction: Optional[str] = None

    # L1: Organization
    user_function: Optional[Dict[str, Any]] = None
    user_department: Optional[Dict[str, Any]] = None
    user_role: Optional[Dict[str, Any]] = None
    user_team: Optional[Dict[str, Any]] = None

    # L2: Process
    workflow_templates: List[Dict[str, Any]] = field(default_factory=list)
    relevant_stages: List[Dict[str, Any]] = field(default_factory=list)

    # L3: JTBD
    relevant_jtbds: List[Dict[str, Any]] = field(default_factory=list)
    pain_points: List[Dict[str, Any]] = field(default_factory=list)
    desired_outcomes: List[Dict[str, Any]] = field(default_factory=list)

    # L4: Agents
    recommended_agents: List[Dict[str, Any]] = field(default_factory=list)
    agent_synergy_score: float = 0.0
    agent_capabilities: List[str] = field(default_factory=list)

    # L5: Execution
    execution_config: Optional[Dict[str, Any]] = None
    runner_family: Optional[str] = None
    estimated_duration_seconds: float = 0.0

    # L6: Analytics
    user_history: Optional[Dict[str, Any]] = None
    similar_queries: List[Dict[str, Any]] = field(default_factory=list)
    quality_expectations: Optional[Dict[str, Any]] = None

    # L7: Value
    vpanes_context: Optional[Dict[str, Any]] = None
    estimated_value_score: float = 0.0
    roi_estimate: Optional[Dict[str, Any]] = None

    # Metadata
    resolved_at: datetime = field(default_factory=datetime.utcnow)
    resolution_time_ms: float = 0.0
    layers_resolved: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary for serialization."""
        return {
            "l0_domain": {
                "therapeutic_area": self.therapeutic_area,
                "evidence_types": self.evidence_types,
                "rag_namespaces": self.rag_namespaces,
                "jurisdiction": self.jurisdiction,
            },
            "l1_organization": {
                "function": self.user_function,
                "department": self.user_department,
                "role": self.user_role,
                "team": self.user_team,
            },
            "l2_process": {
                "workflow_templates": self.workflow_templates,
                "relevant_stages": self.relevant_stages,
            },
            "l3_jtbd": {
                "relevant_jtbds": self.relevant_jtbds,
                "pain_points": self.pain_points,
                "desired_outcomes": self.desired_outcomes,
            },
            "l4_agents": {
                "recommended_agents": self.recommended_agents,
                "synergy_score": self.agent_synergy_score,
                "capabilities": self.agent_capabilities,
            },
            "l5_execution": {
                "config": self.execution_config,
                "runner_family": self.runner_family,
                "estimated_duration_seconds": self.estimated_duration_seconds,
            },
            "l6_analytics": {
                "user_history": self.user_history,
                "similar_queries": self.similar_queries,
                "quality_expectations": self.quality_expectations,
            },
            "l7_value": {
                "vpanes_context": self.vpanes_context,
                "estimated_value_score": self.estimated_value_score,
                "roi_estimate": self.roi_estimate,
            },
            "metadata": {
                "resolved_at": self.resolved_at.isoformat(),
                "resolution_time_ms": self.resolution_time_ms,
                "layers_resolved": self.layers_resolved,
            },
        }


class OntologyLayerService(ABC, Generic[T]):
    """
    Base class for all ontology layer services.

    Each layer (L0-L7) should have a service that extends this class,
    providing layer-specific operations while sharing common functionality.

    Type Parameters:
        T: The primary Pydantic model type for this layer's entities

    Example:
        class L0DomainService(OntologyLayerService[TherapeuticArea]):
            @property
            def layer_name(self) -> str:
                return "l0_domain"

            @property
            def primary_table(self) -> str:
                return "l0_therapeutic_areas"
    """

    def __init__(self, supabase_client: Any, tenant_id: str):
        """
        Initialize the layer service.

        Args:
            supabase_client: Async Supabase client for database operations
            tenant_id: Current tenant ID for RLS filtering
        """
        self.supabase = supabase_client
        self.tenant_id = tenant_id
        self._cache: Dict[str, Any] = {}
        self._cache_ttl_seconds: int = 300  # 5 minutes default

    @property
    @abstractmethod
    def layer_name(self) -> str:
        """
        Return the layer identifier (e.g., 'l0_domain', 'l3_jtbd').

        This is used for caching, logging, and metrics.
        """
        pass

    @property
    @abstractmethod
    def primary_table(self) -> str:
        """
        Return the primary database table for this layer.

        This is used for basic CRUD operations.
        """
        pass

    @abstractmethod
    def _to_model(self, data: Dict[str, Any]) -> T:
        """
        Convert a database row to the layer's Pydantic model.

        Args:
            data: Raw database row as dictionary

        Returns:
            Typed Pydantic model instance
        """
        pass

    async def get_by_id(self, entity_id: str) -> Optional[T]:
        """
        Fetch an entity by ID with tenant filtering.

        Args:
            entity_id: The entity's UUID

        Returns:
            The entity if found, None otherwise
        """
        cache_key = f"{self.layer_name}:{entity_id}"

        # Check cache first
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if cached.get("expires_at", 0) > datetime.utcnow().timestamp():
                return cached.get("data")

        # Query database
        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("id", entity_id)\
                .eq("tenant_id", self.tenant_id)\
                .maybe_single()\
                .execute()

            if result.data:
                entity = self._to_model(result.data)
                # Cache the result
                self._cache[cache_key] = {
                    "data": entity,
                    "expires_at": datetime.utcnow().timestamp() + self._cache_ttl_seconds
                }
                return entity
        except Exception as e:
            # Log error but don't fail
            print(f"Error fetching {self.layer_name} entity {entity_id}: {e}")

        return None

    async def get_by_ids(self, entity_ids: List[str]) -> List[T]:
        """
        Fetch multiple entities by IDs.

        Args:
            entity_ids: List of entity UUIDs

        Returns:
            List of found entities (may be fewer than requested)
        """
        if not entity_ids:
            return []

        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .in_("id", entity_ids)\
                .eq("tenant_id", self.tenant_id)\
                .execute()

            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error fetching {self.layer_name} entities: {e}")
            return []

    async def list_all(
        self,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "created_at",
        ascending: bool = False
    ) -> List[T]:
        """
        List all entities for the current tenant.

        Args:
            limit: Maximum number of entities to return
            offset: Number of entities to skip
            order_by: Column to order by
            ascending: Sort direction

        Returns:
            List of entities
        """
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .order(order_by, desc=not ascending)\
                .range(offset, offset + limit - 1)

            result = await query.execute()
            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error listing {self.layer_name} entities: {e}")
            return []

    async def search(
        self,
        query: str,
        search_column: str = "name",
        limit: int = 10
    ) -> List[T]:
        """
        Search entities using text search.

        Args:
            query: Search query string
            search_column: Column to search in
            limit: Maximum results

        Returns:
            List of matching entities
        """
        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .ilike(search_column, f"%{query}%")\
                .limit(limit)\
                .execute()

            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error searching {self.layer_name}: {e}")
            return []

    def clear_cache(self) -> None:
        """Clear the service's cache."""
        self._cache.clear()

    def invalidate_cache(self, entity_id: str) -> None:
        """Invalidate cache for a specific entity."""
        cache_key = f"{self.layer_name}:{entity_id}"
        self._cache.pop(cache_key, None)

    def set_cache_ttl(self, ttl_seconds: int) -> None:
        """Set the cache TTL for this service."""
        self._cache_ttl_seconds = ttl_seconds


class OntologyLayerError(Exception):
    """Base exception for ontology layer errors."""

    def __init__(self, layer: str, message: str, details: Optional[Dict] = None):
        self.layer = layer
        self.message = message
        self.details = details or {}
        super().__init__(f"[{layer}] {message}")


class EntityNotFoundError(OntologyLayerError):
    """Raised when an entity is not found."""
    pass


class ValidationError(OntologyLayerError):
    """Raised when validation fails."""
    pass


class ResolutionError(OntologyLayerError):
    """Raised when context resolution fails."""
    pass
