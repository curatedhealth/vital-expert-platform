"""
Dependency injection for Ask Panel API

Provides FastAPI dependencies for panel services.
Integrates with existing ai-engine Supabase client.
"""

from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from uuid import UUID
import structlog

from services.supabase_client import SupabaseClient
from services.tenant_aware_supabase import TenantAwareSupabaseClient

# Panel repository (conditionally imported)
try:
    from repositories.panel_repository import PanelRepository
except ImportError:
    # Fallback: panel repository not available
    PanelRepository = None

from services.consensus_calculator import SimpleConsensusCalculator
from services.agent_usage_tracker import AgentUsageTracker

# Panel workflow (conditionally imported)
try:
    from workflows.simple_panel_workflow import SimplePanelWorkflow
except ImportError:
    # Fallback: panel workflow not available
    SimplePanelWorkflow = None

from vital_shared_kernel.multi_tenant import TenantId, TenantContext, TenantContextNotSetError

logger = structlog.get_logger()

# Global service instances (initialized in lifespan)
_supabase_client: Optional[SupabaseClient] = None
_tenant_aware_client: Optional[TenantAwareSupabaseClient] = None


def set_supabase_client(client: SupabaseClient):
    """Set global Supabase client (called during app startup)"""
    global _supabase_client
    _supabase_client = client
    logger.info("dependency_injection_supabase_client_set")


def get_supabase_client() -> SupabaseClient:
    """
    Get Supabase client dependency.
    
    Returns:
        SupabaseClient instance
        
    Raises:
        HTTPException: If Supabase not initialized
    """
    if _supabase_client is None:
        logger.error("supabase_client_not_initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not available"
        )
    return _supabase_client


def get_tenant_aware_client(
    supabase: SupabaseClient = Depends(get_supabase_client)
) -> TenantAwareSupabaseClient:
    """
    Get tenant-aware Supabase client.
    
    Wraps the Supabase client with automatic tenant injection.
    Uses TenantContext set by middleware.
    
    Args:
        supabase: Supabase client from dependency
        
    Returns:
        TenantAwareSupabaseClient instance
        
    Raises:
        HTTPException: If tenant context not set
    """
    try:
        # Verify tenant context is set (should be set by middleware)
        tenant_id = TenantContext.get()
        
        # Create tenant-aware client wrapping the Supabase client
        tenant_client = TenantAwareSupabaseClient(supabase.client)
        
        logger.debug(
            "tenant_aware_client_created",
            tenant_id=str(tenant_id)
        )
        
        return tenant_client
        
    except TenantContextNotSetError:
        logger.error("tenant_context_not_set_in_dependency")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tenant context not set. Please include X-Tenant-ID header."
        )


def get_panel_repository(
    tenant_client: TenantAwareSupabaseClient = Depends(get_tenant_aware_client)
) -> PanelRepository:
    """
    Get panel repository.

    Args:
        tenant_client: Tenant-aware Supabase client

    Returns:
        PanelRepository instance

    Raises:
        HTTPException: If panel repository not available
    """
    if PanelRepository is None:
        logger.error("panel_repository_not_available")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Panel repository feature not available"
        )
    return PanelRepository(tenant_client)


def get_consensus_calculator() -> SimpleConsensusCalculator:
    """
    Get consensus calculator.
    
    Returns:
        SimpleConsensusCalculator instance
    """
    return SimpleConsensusCalculator()


def get_usage_tracker(
    tenant_client: TenantAwareSupabaseClient = Depends(get_tenant_aware_client)
) -> AgentUsageTracker:
    """
    Get agent usage tracker.
    
    Args:
        tenant_client: Tenant-aware Supabase client
        
    Returns:
        AgentUsageTracker instance
    """
    return AgentUsageTracker(tenant_client)


def get_panel_workflow(
    panel_repo: PanelRepository = Depends(get_panel_repository),
    consensus_calc: SimpleConsensusCalculator = Depends(get_consensus_calculator),
    usage_tracker: AgentUsageTracker = Depends(get_usage_tracker)
) -> SimplePanelWorkflow:
    """
    Get panel workflow.

    Args:
        panel_repo: Panel repository
        consensus_calc: Consensus calculator
        usage_tracker: Usage tracker

    Returns:
        SimplePanelWorkflow instance

    Raises:
        HTTPException: If panel workflow not available
    """
    if SimplePanelWorkflow is None:
        logger.error("panel_workflow_not_available")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Panel workflow feature not available"
        )
    return SimplePanelWorkflow(
        panel_repo,
        consensus_calc,
        usage_tracker,
        max_experts=5  # MVP default
    )


def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-ID")
) -> UUID:
    """
    Get current user ID from header.
    
    For MVP: Simple header-based user identification.
    Week 3 Day 13: Will replace with JWT authentication.
    
    Args:
        x_user_id: User ID from X-User-ID header
        
    Returns:
        User UUID
        
    Raises:
        HTTPException: If user ID not provided or invalid
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-ID header required"
        )
    
    try:
        user_uuid = UUID(x_user_id)
        return user_uuid
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-User-ID format (must be UUID)"
        )


def get_tenant_id_from_context() -> TenantId:
    """
    Get tenant ID from context (set by middleware).
    
    Returns:
        TenantId
        
    Raises:
        HTTPException: If tenant context not set
    """
    try:
        return TenantContext.get()
    except TenantContextNotSetError:
        logger.error("tenant_context_not_set")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tenant context not set"
        )


# Simplified dependency for optional features
def get_optional_supabase() -> Optional[SupabaseClient]:
    """Get Supabase client or None if not available (for optional features)"""
    return _supabase_client

