# 🌐 Phase 4: API Layer & Real-time Streaming
## Complete Implementation Guide - REST API, SSE Streaming & WebSocket Support

**Duration**: 5-7 days  
**Complexity**: Medium-High  
**Prerequisites**: Phase 3 complete (Domain layer)  
**Next Phase**: Phase 5 - Frontend Multi-Tenant Isolation

---

## 📋 Overview

Phase 4 builds the API layer with FastAPI REST endpoints and Server-Sent Events (SSE) for real-time panel streaming. By the end of this phase, clients can create panels and watch expert discussions unfold in real-time.

### What You'll Build

```
Client Request
   ↓
┌─────────────────────────────────────┐
│   FastAPI REST API (4.1)            │
│   • POST /api/v1/panels             │
│   • GET /api/v1/panels/{id}         │
│   • POST /api/v1/panels/{id}/stream │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┬───────────────┐
         ↓           ↓               ↓
┌────────────┐ ┌──────────┐ ┌────────────────┐
│ Domain     │ │ SSE      │ │ Tenant         │
│ Services   │ │ Streaming│ │ Middleware     │
│ (4.2)      │ │ (4.3)    │ │ (from Phase 2) │
└────────────┘ └──────────┘ └────────────────┘
```

### Phase 4 Components

**4.1** - REST API Endpoints (Create, Read, List panels)  
**4.2** - Panel Application Service (Orchestration layer)  
**4.3** - SSE Streaming Infrastructure  
**4.4** - Panel Repository Implementation  
**4.5** - API Testing & Validation  

---

## PROMPT 4.1: REST API Endpoints

**Copy this entire section to Cursor AI:**

```
TASK: Create FastAPI REST API endpoints for Ask Panel service

CONTEXT:
Building REST API with multi-tenant security, validation, and error handling.
All endpoints require X-Tenant-ID header and proper authentication.

REQUIREMENTS:
- FastAPI router with dependency injection
- Pydantic models for request/response
- Multi-tenant middleware integration
- Comprehensive error handling
- OpenAPI documentation
- Input validation

LOCATION: services/ask-panel-service/src/api/

CREATE FILES:

1. routes/v1/panels.py

```python
"""Panel API Routes - REST endpoints for panel management"""

from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
import logging

from vital_shared_kernel.multi_tenant import TenantId, TenantContext

from ...application.services.panel_service import PanelService
from ...application.dto.panel_dto import (
    CreatePanelRequest,
    PanelResponse,
    PanelListResponse
)
from ..dependencies import get_panel_service, validate_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/panels", tags=["panels"])


@router.post("", response_model=PanelResponse, status_code=201)
async def create_panel(
    request: CreatePanelRequest,
    panel_service: PanelService = Depends(get_panel_service),
    tenant_id: TenantId = Depends(validate_tenant)
):
    """
    Create a new panel discussion.
    
    Requires:
    - X-Tenant-ID header
    - Valid authentication token
    
    Returns:
    - panel_id
    - estimated_duration
    - status
    """
    try:
        logger.info(
            "Creating panel",
            extra={
                "tenant_id": str(tenant_id),
                "panel_type": request.panel_type,
                "query_length": len(request.query)
            }
        )
        
        panel = await panel_service.create_panel(
            query=request.query,
            panel_type=request.panel_type,
            agent_ids=request.agent_ids,
            configuration=request.configuration
        )
        
        return PanelResponse.from_panel(panel)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Panel creation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to create panel"
        )


@router.get("/{panel_id}", response_model=PanelResponse)
async def get_panel(
    panel_id: str,
    panel_service: PanelService = Depends(get_panel_service),
    tenant_id: TenantId = Depends(validate_tenant)
):
    """
    Get panel by ID.
    
    Returns full panel details including:
    - Query and configuration
    - Expert members
    - Discussion rounds
    - Consensus result
    - Final recommendation
    """
    try:
        panel = await panel_service.get_panel(panel_id)
        
        if not panel:
            raise HTTPException(status_code=404, detail="Panel not found")
        
        return PanelResponse.from_panel(panel)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get panel: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve panel")


@router.get("", response_model=PanelListResponse)
async def list_panels(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    panel_type: Optional[str] = None,
    panel_service: PanelService = Depends(get_panel_service),
    tenant_id: TenantId = Depends(validate_tenant)
):
    """
    List panels for current tenant.
    
    Supports filtering by:
    - status (draft, in_progress, completed, etc.)
    - panel_type (structured, open, socratic, etc.)
    
    Pagination:
    - limit: max results (default 50, max 100)
    - offset: skip N results
    """
    if limit > 100:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 100")
    
    try:
        panels, total = await panel_service.list_panels(
            limit=limit,
            offset=offset,
            status=status,
            panel_type=panel_type
        )
        
        return PanelListResponse(
            panels=[PanelResponse.from_panel(p) for p in panels],
            total=total,
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        logger.error(f"Failed to list panels: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list panels")


@router.post("/{panel_id}/execute", status_code=202)
async def execute_panel(
    panel_id: str,
    panel_service: PanelService = Depends(get_panel_service),
    tenant_id: TenantId = Depends(validate_tenant)
):
    """
    Execute panel asynchronously.
    
    Panel will run in background.
    Use GET /panels/{panel_id} to check status.
    Or use /panels/{panel_id}/stream for real-time updates.
    
    Returns:
    - 202 Accepted (execution started)
    """
    try:
        await panel_service.execute_panel_async(panel_id)
        
        return {
            "panel_id": panel_id,
            "status": "executing",
            "message": "Panel execution started"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to execute panel: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to execute panel")


@router.delete("/{panel_id}", status_code=204)
async def cancel_panel(
    panel_id: str,
    panel_service: PanelService = Depends(get_panel_service),
    tenant_id: TenantId = Depends(validate_tenant)
):
    """
    Cancel a running panel.
    
    Only panels in non-terminal states can be cancelled.
    """
    try:
        await panel_service.cancel_panel(panel_id)
        return None
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to cancel panel: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to cancel panel")
```

2. dependencies.py

```python
"""API Dependencies - Dependency injection for FastAPI"""

from fastapi import Header, HTTPException
from typing import Annotated

from vital_shared_kernel.multi_tenant import TenantId, TenantContext

from ..application.services.panel_service import PanelService
from ..infrastructure.repositories.panel_repository import PanelRepository
from ..infrastructure.database import get_supabase_client


async def validate_tenant(
    x_tenant_id: Annotated[str, Header(alias="X-Tenant-ID")]
) -> TenantId:
    """
    Validate and extract tenant ID from header.
    
    Raises HTTPException if invalid.
    """
    if not x_tenant_id:
        raise HTTPException(
            status_code=400,
            detail="X-Tenant-ID header required"
        )
    
    try:
        tenant_id = TenantId.from_string(x_tenant_id)
        TenantContext.set(tenant_id)
        return tenant_id
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid X-Tenant-ID format"
        )


async def get_panel_service() -> PanelService:
    """Get panel service instance"""
    # In production, use dependency injection container
    repository = PanelRepository(get_supabase_client())
    return PanelService(repository)
```

Implement REST API endpoints with multi-tenant security.
```

---

## PROMPT 4.2: Panel Application Service

```
TASK: Create application service layer for panel orchestration

CONTEXT:
Application service sits between API and domain layer.
Coordinates domain operations, handles transactions, publishes events.

LOCATION: services/ask-panel-service/src/application/

CREATE FILE: services/panel_service.py

```python
"""Panel Application Service - Coordinates panel operations"""

from typing import List, Optional, Tuple, Dict, Any
import logging
import asyncio

from vital_shared_kernel.multi_tenant import TenantContext, TenantId

from ...domain.models.panel import Panel
from ...domain.models.panel_id import PanelId
from ...domain.models.panel_type import PanelType
from ...domain.models.panel_status import PanelStatus
from ...domain.strategies.base_strategy import BasePanelStrategy
from ...domain.strategies.structured_strategy import StructuredPanelStrategy
from ...domain.strategies.open_strategy import OpenPanelStrategy
from ...infrastructure.repositories.panel_repository import PanelRepository

logger = logging.getLogger(__name__)


class PanelService:
    """
    Application service for panel operations.
    
    Responsibilities:
    - Coordinate domain operations
    - Manage transactions
    - Select appropriate strategy
    - Publish domain events
    """
    
    def __init__(self, repository: PanelRepository):
        self.repository = repository
        self.strategies = self._initialize_strategies()
    
    def _initialize_strategies(self) -> Dict[str, BasePanelStrategy]:
        """Initialize all panel strategies"""
        return {
            "structured": StructuredPanelStrategy(),
            "open": OpenPanelStrategy(),
            # Add other strategies as implemented
        }
    
    async def create_panel(
        self,
        query: str,
        panel_type: str,
        agent_ids: Optional[List[str]] = None,
        configuration: Optional[Dict[str, Any]] = None
    ) -> Panel:
        """
        Create new panel.
        
        Steps:
        1. Validate inputs
        2. Create panel aggregate
        3. Add experts if provided
        4. Persist to database
        5. Return panel
        """
        tenant_id = TenantContext.get()
        
        logger.info(
            "Creating panel",
            extra={
                "tenant_id": str(tenant_id),
                "panel_type": panel_type
            }
        )
        
        # Create panel aggregate
        panel = Panel(
            panel_id=PanelId.generate(),
            tenant_id=tenant_id,
            query=query,
            panel_type=PanelType.from_string(panel_type),
            configuration=configuration or {}
        )
        
        # Add experts if provided
        if agent_ids:
            for agent_id in agent_ids:
                # In production, fetch agent details from AgentRegistry
                panel.add_member(
                    agent_id=agent_id,
                    agent_name=f"Agent {agent_id}",
                    agent_role="Expert"
                )
        
        # Persist
        await self.repository.save(panel)
        
        logger.info(
            "Panel created",
            extra={
                "tenant_id": str(tenant_id),
                "panel_id": str(panel.panel_id)
            }
        )
        
        return panel
    
    async def get_panel(self, panel_id: str) -> Optional[Panel]:
        """Get panel by ID"""
        tenant_id = TenantContext.get()
        
        panel_id_obj = PanelId.from_string(panel_id)
        panel = await self.repository.find_by_id(panel_id_obj)
        
        if panel and panel.tenant_id != tenant_id:
            raise ValueError("Panel not found")  # Hide cross-tenant access
        
        return panel
    
    async def list_panels(
        self,
        limit: int = 50,
        offset: int = 0,
        status: Optional[str] = None,
        panel_type: Optional[str] = None
    ) -> Tuple[List[Panel], int]:
        """List panels for current tenant"""
        tenant_id = TenantContext.get()
        
        return await self.repository.find_by_tenant(
            tenant_id=tenant_id,
            limit=limit,
            offset=offset,
            status=status,
            panel_type=panel_type
        )
    
    async def execute_panel_async(self, panel_id: str) -> None:
        """Execute panel asynchronously (fire and forget)"""
        tenant_id = TenantContext.get()
        
        # Get panel
        panel = await self.get_panel(panel_id)
        if not panel:
            raise ValueError("Panel not found")
        
        # Execute in background
        asyncio.create_task(self._execute_panel_background(panel))
    
    async def _execute_panel_background(self, panel: Panel) -> None:
        """Execute panel in background"""
        try:
            # Set tenant context
            TenantContext.set(panel.tenant_id)
            
            # Select strategy
            strategy = self._select_strategy(panel.panel_type)
            
            # Execute
            panel = await strategy.execute(panel)
            
            # Save result
            await self.repository.save(panel)
            
        except Exception as e:
            logger.error(
                f"Panel execution failed: {str(e)}",
                exc_info=True
            )
            panel.fail(str(e))
            await self.repository.save(panel)
    
    def _select_strategy(self, panel_type: PanelType) -> BasePanelStrategy:
        """Select appropriate strategy for panel type"""
        strategy_key = str(panel_type)
        
        if strategy_key not in self.strategies:
            raise ValueError(f"No strategy for panel type: {panel_type}")
        
        return self.strategies[strategy_key]
    
    async def cancel_panel(self, panel_id: str) -> None:
        """Cancel running panel"""
        panel = await self.get_panel(panel_id)
        if not panel:
            raise ValueError("Panel not found")
        
        if panel.status.is_terminal:
            raise ValueError("Cannot cancel terminal panel")
        
        from ...domain.models.panel_status import CANCELLED
        panel.change_status(CANCELLED)
        
        await self.repository.save(panel)
```

Implement application service with transaction coordination.
```

---

## PROMPT 4.3: SSE Streaming Infrastructure

```
TASK: Create Server-Sent Events (SSE) streaming for real-time panel updates

CONTEXT:
SSE allows server to push events to client in real-time.
Perfect for streaming expert discussion as it happens.

LOCATION: services/ask-panel-service/src/api/routes/v1/

CREATE FILE: streaming.py

```python
"""SSE Streaming for Real-time Panel Updates"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import asyncio
import json
import logging

from vital_shared_kernel.multi_tenant import TenantId, TenantContext

from ....application.services.panel_service import PanelService
from ....domain.models.panel_status import IN_PROGRESS
from ...dependencies import get_panel_service, validate_tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/panels", tags=["streaming"])


@router.post("/{panel_id}/stream")
async def stream_panel_execution(
    panel_id: str,
    panel_service: PanelService = Depends(get_panel_service),
    tenant_id: TenantId = Depends(validate_tenant)
):
    """
    Stream panel execution in real-time using Server-Sent Events (SSE).
    
    Event types:
    - panel_started: Panel execution begins
    - expert_speaking: Expert contributes to discussion
    - round_complete: Discussion round completes
    - consensus_update: Consensus level changes
    - panel_complete: Panel execution finished
    - error: Error occurred
    
    Response format:
    ```
    event: expert_speaking
    data: {"agent_id": "...", "content": "..."}
    
    ```
    """
    try:
        # Validate panel exists and belongs to tenant
        panel = await panel_service.get_panel(panel_id)
        if not panel:
            raise HTTPException(status_code=404, detail="Panel not found")
        
        # Create SSE stream
        return StreamingResponse(
            event_stream(panel_id, panel_service, tenant_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start stream: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to start stream")


async def event_stream(
    panel_id: str,
    panel_service: PanelService,
    tenant_id: TenantId
) -> AsyncGenerator[str, None]:
    """
    Generate SSE event stream for panel execution.
    
    Yields formatted SSE events.
    """
    try:
        # Set tenant context
        TenantContext.set(tenant_id)
        
        # Send initial event
        yield format_sse_event("panel_started", {
            "panel_id": panel_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Start panel execution in background
        await panel_service.execute_panel_async(panel_id)
        
        # Poll for updates
        last_message_count = 0
        while True:
            # Get current panel state
            panel = await panel_service.get_panel(panel_id)
            
            if not panel:
                yield format_sse_event("error", {
                    "message": "Panel not found"
                })
                break
            
            # Send new messages
            current_message_count = panel.total_messages
            if current_message_count > last_message_count:
                # Get new messages
                for discussion in panel.discussions:
                    for message in discussion.messages[last_message_count:]:
                        yield format_sse_event("expert_speaking", {
                            "agent_id": message.agent_id,
                            "agent_name": message.agent_name,
                            "content": message.content,
                            "timestamp": message.timestamp.isoformat(),
                            "round": discussion.round_number
                        })
                
                last_message_count = current_message_count
            
            # Send consensus updates
            if panel.consensus:
                yield format_sse_event("consensus_update", {
                    "level": panel.consensus.level,
                    "confidence": panel.consensus.confidence
                })
            
            # Check if complete
            if panel.is_complete:
                yield format_sse_event("panel_complete", {
                    "panel_id": panel_id,
                    "recommendation": panel.final_recommendation,
                    "consensus": panel.consensus.level if panel.consensus else 0,
                    "duration": panel.duration_seconds
                })
                break
            
            # Wait before next poll
            await asyncio.sleep(1)
            
    except Exception as e:
        logger.error(f"Stream error: {str(e)}", exc_info=True)
        yield format_sse_event("error", {
            "message": str(e)
        })


def format_sse_event(event_type: str, data: dict) -> str:
    """
    Format data as SSE event.
    
    Format:
    event: event_type
    data: json_data
    
    """
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
```

Implement SSE streaming with real-time panel updates.
```

---

## ✅ Phase 4 Checklist

**REST API** (4.1):
- [ ] Panel creation endpoint
- [ ] Panel retrieval endpoint
- [ ] Panel listing with filters
- [ ] Panel execution endpoint
- [ ] Panel cancellation endpoint
- [ ] Multi-tenant security on all endpoints

**Application Service** (4.2):
- [ ] Panel creation logic
- [ ] Strategy selection
- [ ] Async execution
- [ ] Transaction management

**SSE Streaming** (4.3):
- [ ] Stream endpoint
- [ ] Event formatting
- [ ] Real-time updates
- [ ] Connection management

**Repository** (4.4):
- [ ] Panel persistence
- [ ] Tenant filtering
- [ ] Query methods

**Testing** (4.5):
- [ ] Unit tests for service layer
- [ ] Integration tests for API
- [ ] SSE streaming tests
- [ ] Load tests

---

## 🧪 Validation

```bash
# Start FastAPI server
uvicorn src.api.main:app --reload

# Test panel creation
curl -X POST http://localhost:8000/api/v1/panels \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111" \
  -d '{
    "query": "FDA 510(k) strategy?",
    "panel_type": "structured",
    "agent_ids": ["fda_expert", "clinical_expert"]
  }'

# Test SSE streaming (using curl)
curl -N http://localhost:8000/api/v1/panels/{panel_id}/stream \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111"

# Should see events stream in real-time
```

---

**Phase 4 Complete** ✅ | **Next**: Phase 5 - Frontend Multi-Tenant Isolation
