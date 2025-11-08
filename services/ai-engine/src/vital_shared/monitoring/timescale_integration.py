"""
TimescaleDB Integration for Unified Analytics Warehouse.

This module bridges Prometheus metrics to TimescaleDB analytics tables,
enabling per-tenant cost attribution, business intelligence, and executive dashboards.

Schema Reference: database/sql/migrations/2025/20251104000000_unified_analytics_schema.sql

Tables:
- analytics.platform_events: Unified event stream
- analytics.tenant_cost_events: Cost tracking for billing
- analytics.agent_executions: Agent performance and quality
"""

import asyncio
import structlog
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum

# Supabase client (assumed to be configured elsewhere)
try:
    from supabase import create_client, Client
except ImportError:
    # Graceful degradation if Supabase not installed
    Client = None

logger = structlog.get_logger(__name__)


# ============================================================================
# ENUMS (Match TimescaleDB Schema)
# ============================================================================

class EventCategory(str, Enum):
    """Event categories for platform_events table"""
    USER_BEHAVIOR = "user_behavior"
    AGENT_PERFORMANCE = "agent_performance"
    SYSTEM_HEALTH = "system_health"
    BUSINESS_METRIC = "business_metric"


class CostType(str, Enum):
    """Cost types for tenant_cost_events table"""
    LLM = "llm"
    EMBEDDING = "embedding"
    STORAGE = "storage"
    COMPUTE = "compute"
    SEARCH = "search"
    OTHER = "other"


class ServiceProvider(str, Enum):
    """Service providers for cost attribution"""
    OPENAI = "openai"
    PINECONE = "pinecone"
    MODAL = "modal"
    VERCEL = "vercel"
    SUPABASE = "supabase"
    OTHER = "other"


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class PlatformEvent:
    """Platform event for analytics.platform_events table"""
    tenant_id: str
    event_type: str
    event_category: EventCategory
    event_data: Dict[str, Any]
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    source: Optional[str] = None  # 'ask_expert' | 'ask_panel' | 'workflow' | 'solution_builder'
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


@dataclass
class CostEvent:
    """Cost event for analytics.tenant_cost_events table"""
    tenant_id: str
    cost_type: CostType
    cost_usd: float
    service: ServiceProvider
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    quantity: Optional[int] = None  # tokens, documents, queries, etc.
    unit_price: Optional[float] = None
    service_tier: Optional[str] = None  # 'gpt-4' | 'gpt-4-turbo' | 'ada-002' | etc.
    request_id: Optional[str] = None
    agent_id: Optional[str] = None
    query_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class AgentExecution:
    """Agent execution for analytics.agent_executions table"""
    tenant_id: str
    agent_id: str
    agent_type: str  # 'ask_expert' | 'workflow' | 'custom'
    execution_time_ms: int
    success: bool
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    agent_version: Optional[str] = None
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    quality_score: Optional[float] = None  # 0.00 to 1.00 (RAGAS score)
    user_rating: Optional[int] = None  # 1-5 stars
    citation_accuracy: Optional[float] = None
    hallucination_detected: bool = False
    compliance_score: Optional[float] = None
    cost_usd: Optional[float] = None
    total_tokens: Optional[int] = None
    query_id: Optional[str] = None
    query_length: Optional[int] = None
    response_length: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# TIMESCALE INTEGRATION CLASS
# ============================================================================

class TimescaleIntegration:
    """
    Bridge between Prometheus metrics and TimescaleDB analytics warehouse.
    
    Responsibilities:
    - Log platform events (user behavior, agent performance, system health)
    - Track costs for billing and attribution
    - Record agent executions with quality metrics
    - Support batching for high-throughput scenarios
    
    Usage:
        timescale = TimescaleIntegration()
        
        # Log platform event
        await timescale.log_platform_event(
            PlatformEvent(
                tenant_id="tenant-123",
                event_type="user_query",
                event_category=EventCategory.USER_BEHAVIOR,
                event_data={"query": "What is diabetes?"}
            )
        )
        
        # Track cost
        await timescale.log_cost_event(
            CostEvent(
                tenant_id="tenant-123",
                cost_type=CostType.LLM,
                cost_usd=0.012,
                service=ServiceProvider.OPENAI,
                quantity=300
            )
        )
        
        # Record agent execution
        await timescale.log_agent_execution(
            AgentExecution(
                tenant_id="tenant-123",
                agent_id="ask-expert-v1",
                agent_type="ask_expert",
                execution_time_ms=2100,
                success=True,
                quality_score=0.92
            )
        )
    """
    
    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        enable_batching: bool = True,
        batch_size: int = 100,
        flush_interval_seconds: int = 5
    ):
        """
        Initialize TimescaleDB integration.
        
        Args:
            supabase_url: Supabase project URL (uses env var if None)
            supabase_key: Supabase service role key (uses env var if None)
            enable_batching: Enable event batching for performance
            batch_size: Number of events to batch before flushing
            flush_interval_seconds: Time interval for automatic flush
        """
        self.logger = logger.bind(component="timescale_integration")
        
        # Initialize Supabase client
        if Client is None:
            self.logger.warning("supabase_not_installed", 
                              message="Supabase client not available, TimescaleDB integration disabled")
            self.client = None
            self.enabled = False
            return
        
        try:
            import os
            self.client: Client = create_client(
                supabase_url or os.getenv("SUPABASE_URL"),
                supabase_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            )
            self.enabled = True
            self.logger.info("timescale_integration_initialized", enabled=True)
        except Exception as e:
            self.logger.error("timescale_initialization_failed", error=str(e))
            self.client = None
            self.enabled = False
        
        # Batching configuration
        self.enable_batching = enable_batching
        self.batch_size = batch_size
        self.flush_interval_seconds = flush_interval_seconds
        
        # Event buffers
        self._platform_events: List[PlatformEvent] = []
        self._cost_events: List[CostEvent] = []
        self._agent_executions: List[AgentExecution] = []
        
        # Background flush task
        self._flush_task: Optional[asyncio.Task] = None
        if self.enabled and enable_batching:
            self._start_background_flush()
    
    # ========================================================================
    # PUBLIC API
    # ========================================================================
    
    async def log_platform_event(self, event: PlatformEvent) -> bool:
        """
        Log platform event to analytics.platform_events table.
        
        Args:
            event: Platform event to log
            
        Returns:
            True if successful (or queued), False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            if self.enable_batching:
                self._platform_events.append(event)
                
                # Flush if batch is full
                if len(self._platform_events) >= self.batch_size:
                    await self._flush_platform_events()
                
                return True
            else:
                # Immediate insert
                return await self._insert_platform_event(event)
        
        except Exception as e:
            self.logger.error("platform_event_log_failed", 
                            event_type=event.event_type,
                            error=str(e))
            return False
    
    async def log_cost_event(self, event: CostEvent) -> bool:
        """
        Log cost event to analytics.tenant_cost_events table.
        
        Args:
            event: Cost event to log
            
        Returns:
            True if successful (or queued), False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            if self.enable_batching:
                self._cost_events.append(event)
                
                # Flush if batch is full
                if len(self._cost_events) >= self.batch_size:
                    await self._flush_cost_events()
                
                return True
            else:
                # Immediate insert
                return await self._insert_cost_event(event)
        
        except Exception as e:
            self.logger.error("cost_event_log_failed",
                            cost_type=event.cost_type.value,
                            error=str(e))
            return False
    
    async def log_agent_execution(self, execution: AgentExecution) -> bool:
        """
        Log agent execution to analytics.agent_executions table.
        
        Args:
            execution: Agent execution to log
            
        Returns:
            True if successful (or queued), False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            if self.enable_batching:
                self._agent_executions.append(execution)
                
                # Flush if batch is full
                if len(self._agent_executions) >= self.batch_size:
                    await self._flush_agent_executions()
                
                return True
            else:
                # Immediate insert
                return await self._insert_agent_execution(execution)
        
        except Exception as e:
            self.logger.error("agent_execution_log_failed",
                            agent_id=execution.agent_id,
                            error=str(e))
            return False
    
    async def flush_all(self) -> None:
        """
        Flush all buffered events immediately.
        
        Use this before shutdown or when you need to ensure all events are persisted.
        """
        if not self.enabled:
            return
        
        self.logger.info("flushing_all_events",
                        platform_events=len(self._platform_events),
                        cost_events=len(self._cost_events),
                        agent_executions=len(self._agent_executions))
        
        await asyncio.gather(
            self._flush_platform_events(),
            self._flush_cost_events(),
            self._flush_agent_executions(),
            return_exceptions=True
        )
    
    async def get_tenant_daily_cost(
        self,
        tenant_id: str,
        date: Optional[datetime] = None
    ) -> float:
        """
        Get total cost for a tenant on a specific date.
        
        Args:
            tenant_id: Tenant ID
            date: Date to query (defaults to today)
            
        Returns:
            Total cost in USD
        """
        if not self.enabled:
            return 0.0
        
        try:
            if date is None:
                date = datetime.now()
            
            # Use TimescaleDB function
            result = await self.client.rpc(
                'get_tenant_cost',
                {
                    'p_tenant_id': tenant_id,
                    'p_start_time': date.replace(hour=0, minute=0, second=0).isoformat(),
                    'p_end_time': date.replace(hour=23, minute=59, second=59).isoformat()
                }
            ).execute()
            
            return float(result.data or 0.0)
        
        except Exception as e:
            self.logger.error("get_tenant_cost_failed",
                            tenant_id=tenant_id,
                            error=str(e))
            return 0.0
    
    async def get_agent_success_rate(
        self,
        agent_id: str,
        tenant_id: str,
        hours: int = 24
    ) -> float:
        """
        Get agent success rate over the last N hours.
        
        Args:
            agent_id: Agent ID
            tenant_id: Tenant ID
            hours: Number of hours to look back
            
        Returns:
            Success rate (0-100)
        """
        if not self.enabled:
            return 100.0
        
        try:
            # Use TimescaleDB function
            result = await self.client.rpc(
                'get_agent_success_rate',
                {
                    'p_agent_id': agent_id,
                    'p_tenant_id': tenant_id,
                    'p_hours': hours
                }
            ).execute()
            
            return float(result.data or 100.0)
        
        except Exception as e:
            self.logger.error("get_agent_success_rate_failed",
                            agent_id=agent_id,
                            error=str(e))
            return 100.0
    
    async def close(self) -> None:
        """
        Close the TimescaleDB integration and flush remaining events.
        """
        if self._flush_task:
            self._flush_task.cancel()
            try:
                await self._flush_task
            except asyncio.CancelledError:
                pass
        
        await self.flush_all()
        
        self.logger.info("timescale_integration_closed")
    
    # ========================================================================
    # PRIVATE METHODS
    # ========================================================================
    
    def _start_background_flush(self) -> None:
        """Start background task to flush events periodically"""
        async def flush_loop():
            while True:
                try:
                    await asyncio.sleep(self.flush_interval_seconds)
                    await self.flush_all()
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    self.logger.error("background_flush_failed", error=str(e))
        
        self._flush_task = asyncio.create_task(flush_loop())
    
    async def _flush_platform_events(self) -> None:
        """Flush buffered platform events"""
        if not self._platform_events:
            return
        
        events = self._platform_events[:]
        self._platform_events = []
        
        try:
            rows = [
                {
                    'time': datetime.now().isoformat(),
                    'tenant_id': e.tenant_id,
                    'user_id': e.user_id,
                    'session_id': e.session_id,
                    'event_type': e.event_type,
                    'event_category': e.event_category.value,
                    'event_data': e.event_data,
                    'metadata': e.metadata or {},
                    'source': e.source,
                    'ip_address': e.ip_address,
                    'user_agent': e.user_agent
                }
                for e in events
            ]
            
            await self.client.table('platform_events').insert(rows).execute()
            
            self.logger.info("platform_events_flushed", count=len(events))
        
        except Exception as e:
            self.logger.error("platform_events_flush_failed",
                            count=len(events),
                            error=str(e))
            # Re-add failed events to buffer
            self._platform_events.extend(events)
    
    async def _flush_cost_events(self) -> None:
        """Flush buffered cost events"""
        if not self._cost_events:
            return
        
        events = self._cost_events[:]
        self._cost_events = []
        
        try:
            rows = [
                {
                    'time': datetime.now().isoformat(),
                    'tenant_id': e.tenant_id,
                    'user_id': e.user_id,
                    'session_id': e.session_id,
                    'cost_type': e.cost_type.value,
                    'cost_usd': e.cost_usd,
                    'quantity': e.quantity,
                    'unit_price': e.unit_price,
                    'service': e.service.value,
                    'service_tier': e.service_tier,
                    'request_id': e.request_id,
                    'agent_id': e.agent_id,
                    'query_id': e.query_id,
                    'metadata': e.metadata or {}
                }
                for e in events
            ]
            
            await self.client.table('tenant_cost_events').insert(rows).execute()
            
            self.logger.info("cost_events_flushed", count=len(events))
        
        except Exception as e:
            self.logger.error("cost_events_flush_failed",
                            count=len(events),
                            error=str(e))
            # Re-add failed events to buffer
            self._cost_events.extend(events)
    
    async def _flush_agent_executions(self) -> None:
        """Flush buffered agent executions"""
        if not self._agent_executions:
            return
        
        executions = self._agent_executions[:]
        self._agent_executions = []
        
        try:
            rows = [
                {
                    'time': datetime.now().isoformat(),
                    'tenant_id': e.tenant_id,
                    'user_id': e.user_id,
                    'session_id': e.session_id,
                    'agent_id': e.agent_id,
                    'agent_type': e.agent_type,
                    'agent_version': e.agent_version,
                    'execution_time_ms': e.execution_time_ms,
                    'success': e.success,
                    'error_type': e.error_type,
                    'error_message': e.error_message,
                    'retry_count': e.retry_count,
                    'quality_score': e.quality_score,
                    'user_rating': e.user_rating,
                    'citation_accuracy': e.citation_accuracy,
                    'hallucination_detected': e.hallucination_detected,
                    'compliance_score': e.compliance_score,
                    'cost_usd': e.cost_usd,
                    'total_tokens': e.total_tokens,
                    'query_id': e.query_id,
                    'query_length': e.query_length,
                    'response_length': e.response_length,
                    'metadata': e.metadata or {}
                }
                for e in executions
            ]
            
            await self.client.table('agent_executions').insert(rows).execute()
            
            self.logger.info("agent_executions_flushed", count=len(executions))
        
        except Exception as e:
            self.logger.error("agent_executions_flush_failed",
                            count=len(executions),
                            error=str(e))
            # Re-add failed executions to buffer
            self._agent_executions.extend(executions)
    
    async def _insert_platform_event(self, event: PlatformEvent) -> bool:
        """Insert single platform event (no batching)"""
        try:
            await self.client.table('platform_events').insert({
                'time': datetime.now().isoformat(),
                'tenant_id': event.tenant_id,
                'user_id': event.user_id,
                'session_id': event.session_id,
                'event_type': event.event_type,
                'event_category': event.event_category.value,
                'event_data': event.event_data,
                'metadata': event.metadata or {},
                'source': event.source,
                'ip_address': event.ip_address,
                'user_agent': event.user_agent
            }).execute()
            return True
        except Exception as e:
            self.logger.error("platform_event_insert_failed", error=str(e))
            return False
    
    async def _insert_cost_event(self, event: CostEvent) -> bool:
        """Insert single cost event (no batching)"""
        try:
            await self.client.table('tenant_cost_events').insert({
                'time': datetime.now().isoformat(),
                'tenant_id': event.tenant_id,
                'user_id': event.user_id,
                'session_id': event.session_id,
                'cost_type': event.cost_type.value,
                'cost_usd': event.cost_usd,
                'quantity': event.quantity,
                'unit_price': event.unit_price,
                'service': event.service.value,
                'service_tier': event.service_tier,
                'request_id': event.request_id,
                'agent_id': event.agent_id,
                'query_id': event.query_id,
                'metadata': event.metadata or {}
            }).execute()
            return True
        except Exception as e:
            self.logger.error("cost_event_insert_failed", error=str(e))
            return False
    
    async def _insert_agent_execution(self, execution: AgentExecution) -> bool:
        """Insert single agent execution (no batching)"""
        try:
            await self.client.table('agent_executions').insert({
                'time': datetime.now().isoformat(),
                'tenant_id': execution.tenant_id,
                'user_id': execution.user_id,
                'session_id': execution.session_id,
                'agent_id': execution.agent_id,
                'agent_type': execution.agent_type,
                'agent_version': execution.agent_version,
                'execution_time_ms': execution.execution_time_ms,
                'success': execution.success,
                'error_type': execution.error_type,
                'error_message': execution.error_message,
                'retry_count': execution.retry_count,
                'quality_score': execution.quality_score,
                'user_rating': execution.user_rating,
                'citation_accuracy': execution.citation_accuracy,
                'hallucination_detected': execution.hallucination_detected,
                'compliance_score': execution.compliance_score,
                'cost_usd': execution.cost_usd,
                'total_tokens': execution.total_tokens,
                'query_id': execution.query_id,
                'query_length': execution.query_length,
                'response_length': execution.response_length,
                'metadata': execution.metadata or {}
            }).execute()
            return True
        except Exception as e:
            self.logger.error("agent_execution_insert_failed", error=str(e))
            return False


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

# Global instance (lazy-initialized)
_timescale_instance: Optional[TimescaleIntegration] = None


def get_timescale_integration() -> TimescaleIntegration:
    """
    Get singleton TimescaleDB integration instance.
    
    Returns:
        TimescaleIntegration instance
    """
    global _timescale_instance
    
    if _timescale_instance is None:
        _timescale_instance = TimescaleIntegration()
    
    return _timescale_instance

