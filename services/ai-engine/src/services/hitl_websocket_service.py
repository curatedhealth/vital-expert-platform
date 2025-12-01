"""
HITL WebSocket Service for Real-Time Approvals

Provides real-time WebSocket communication for Human-in-the-Loop approvals.
Integrates with the PostgreSQL checkpointer for persistence.

Features:
- WebSocket connection management per tenant/user
- Real-time approval request broadcasting
- Approval response handling
- Connection heartbeat and cleanup
- Redis pub/sub for multi-instance support

Phase 6 Implementation - Production Ready
"""

import os
import json
import asyncio
from typing import Dict, Any, Optional, Set, Callable, Awaitable
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import structlog

# WebSocket imports
try:
    from fastapi import WebSocket, WebSocketDisconnect
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    WebSocket = object

# Redis imports for pub/sub
try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from services.postgres_checkpointer import get_postgres_checkpointer
from services.hitl_service import (
    HITLCheckpoint,
    HITLSafetyLevel,
    ApprovalStatus,
    HITLApprovalResponse,
    PlanApprovalRequest,
    ToolExecutionApprovalRequest,
    SubAgentApprovalRequest,
    CriticalDecisionApprovalRequest,
    ArtifactGenerationApprovalRequest,
)

logger = structlog.get_logger()


# ============================================================================
# CONNECTION MANAGER
# ============================================================================

@dataclass
class WebSocketConnection:
    """Represents an active WebSocket connection"""
    websocket: WebSocket
    tenant_id: str
    user_id: str
    connected_at: datetime = field(default_factory=datetime.utcnow)
    last_heartbeat: datetime = field(default_factory=datetime.utcnow)
    subscribed_threads: Set[str] = field(default_factory=set)


class HITLConnectionManager:
    """
    Manages WebSocket connections for HITL approvals.

    Features:
    - Tenant-isolated connections
    - User-specific approval routing
    - Heartbeat monitoring
    - Automatic reconnection handling
    """

    def __init__(self):
        # Connections indexed by tenant_id -> user_id -> connection
        self._connections: Dict[str, Dict[str, WebSocketConnection]] = {}

        # Pending approvals waiting for response
        self._pending_responses: Dict[str, asyncio.Future] = {}

        # Heartbeat interval (seconds)
        self.heartbeat_interval = 30

        # Connection timeout (seconds)
        self.connection_timeout = 120

        # Redis pub/sub for multi-instance
        self._redis: Optional[aioredis.Redis] = None
        self._pubsub_task: Optional[asyncio.Task] = None

    async def initialize(self):
        """Initialize connection manager with Redis pub/sub"""
        if REDIS_AVAILABLE:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            try:
                self._redis = await aioredis.from_url(redis_url)
                self._pubsub_task = asyncio.create_task(self._redis_subscriber())
                logger.info("hitl_redis_pubsub_initialized")
            except Exception as e:
                logger.warning("hitl_redis_connection_failed", error=str(e))

    async def _redis_subscriber(self):
        """Subscribe to Redis channel for cross-instance HITL events"""
        if not self._redis:
            return

        try:
            pubsub = self._redis.pubsub()
            await pubsub.subscribe("hitl_approvals")

            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        await self._handle_redis_message(data)
                    except json.JSONDecodeError:
                        pass

        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error("hitl_redis_subscriber_error", error=str(e))

    async def _handle_redis_message(self, data: Dict[str, Any]):
        """Handle message from Redis pub/sub"""
        message_type = data.get("type")

        if message_type == "approval_request":
            await self._broadcast_approval_request(
                tenant_id=data["tenant_id"],
                approval_data=data["approval"]
            )
        elif message_type == "approval_response":
            await self._handle_approval_response(
                approval_id=data["approval_id"],
                response=data["response"]
            )

    async def connect(
        self,
        websocket: WebSocket,
        tenant_id: str,
        user_id: str
    ) -> WebSocketConnection:
        """
        Register new WebSocket connection.

        Args:
            websocket: FastAPI WebSocket instance
            tenant_id: Tenant UUID
            user_id: User UUID

        Returns:
            WebSocketConnection instance
        """
        await websocket.accept()

        connection = WebSocketConnection(
            websocket=websocket,
            tenant_id=tenant_id,
            user_id=user_id
        )

        # Store connection
        if tenant_id not in self._connections:
            self._connections[tenant_id] = {}

        self._connections[tenant_id][user_id] = connection

        logger.info(
            "hitl_websocket_connected",
            tenant_id=tenant_id[:8],
            user_id=user_id[:8]
        )

        # Send pending approvals on connect
        await self._send_pending_approvals(connection)

        return connection

    async def disconnect(self, tenant_id: str, user_id: str):
        """Remove WebSocket connection"""
        if tenant_id in self._connections:
            if user_id in self._connections[tenant_id]:
                del self._connections[tenant_id][user_id]

                logger.info(
                    "hitl_websocket_disconnected",
                    tenant_id=tenant_id[:8],
                    user_id=user_id[:8]
                )

                # Clean up empty tenant dict
                if not self._connections[tenant_id]:
                    del self._connections[tenant_id]

    async def _send_pending_approvals(self, connection: WebSocketConnection):
        """Send all pending approvals to newly connected user"""
        try:
            checkpointer = await get_postgres_checkpointer()
            pending = await checkpointer.get_pending_approvals(connection.tenant_id)

            if pending:
                await connection.websocket.send_json({
                    "type": "pending_approvals",
                    "approvals": pending
                })

                logger.debug(
                    "hitl_pending_approvals_sent",
                    count=len(pending),
                    user_id=connection.user_id[:8]
                )

        except Exception as e:
            logger.error("hitl_send_pending_failed", error=str(e))

    async def broadcast_approval_request(
        self,
        tenant_id: str,
        approval_id: str,
        checkpoint_type: str,
        request_data: Dict[str, Any],
        thread_id: str
    ):
        """
        Broadcast approval request to all connected users in tenant.

        Args:
            tenant_id: Tenant UUID
            approval_id: Approval request ID
            checkpoint_type: Type of HITL checkpoint
            request_data: Request details
            thread_id: Workflow thread ID
        """
        approval_data = {
            "id": approval_id,
            "checkpoint_type": checkpoint_type,
            "request_data": request_data,
            "thread_id": thread_id,
            "created_at": datetime.utcnow().isoformat()
        }

        # Broadcast to local connections
        await self._broadcast_approval_request(tenant_id, approval_data)

        # Publish to Redis for other instances
        if self._redis:
            try:
                await self._redis.publish("hitl_approvals", json.dumps({
                    "type": "approval_request",
                    "tenant_id": tenant_id,
                    "approval": approval_data
                }))
            except Exception as e:
                logger.error("hitl_redis_publish_failed", error=str(e))

    async def _broadcast_approval_request(
        self,
        tenant_id: str,
        approval_data: Dict[str, Any]
    ):
        """Broadcast to local connections only"""
        if tenant_id not in self._connections:
            logger.debug("hitl_no_connections", tenant_id=tenant_id[:8])
            return

        message = {
            "type": "approval_request",
            "approval": approval_data
        }

        # Send to all users in tenant
        disconnected = []
        for user_id, connection in self._connections[tenant_id].items():
            try:
                await connection.websocket.send_json(message)
            except Exception as e:
                logger.warning(
                    "hitl_send_failed",
                    user_id=user_id[:8],
                    error=str(e)
                )
                disconnected.append(user_id)

        # Clean up disconnected
        for user_id in disconnected:
            await self.disconnect(tenant_id, user_id)

    async def wait_for_approval(
        self,
        approval_id: str,
        timeout_seconds: int = 3600
    ) -> Optional[HITLApprovalResponse]:
        """
        Wait for approval response.

        Args:
            approval_id: Approval request ID
            timeout_seconds: Maximum wait time

        Returns:
            Approval response or None on timeout
        """
        # Create future for response
        future: asyncio.Future = asyncio.Future()
        self._pending_responses[approval_id] = future

        try:
            # Wait with timeout
            response = await asyncio.wait_for(future, timeout=timeout_seconds)
            return response

        except asyncio.TimeoutError:
            logger.warning("hitl_approval_timeout", approval_id=approval_id)
            return HITLApprovalResponse(
                checkpoint_id=approval_id,
                status=ApprovalStatus.REJECTED,
                user_feedback="Approval timed out",
                approved_at=datetime.utcnow()
            )

        finally:
            # Clean up
            if approval_id in self._pending_responses:
                del self._pending_responses[approval_id]

    async def handle_approval_response(
        self,
        approval_id: str,
        status: str,
        user_feedback: Optional[str] = None,
        modifications: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ):
        """
        Handle approval response from user.

        Args:
            approval_id: Approval request ID
            status: approved/rejected/modified
            user_feedback: Optional feedback text
            modifications: Optional modifications (for modified status)
            user_id: User responding
        """
        # Map status string to enum
        status_map = {
            "approved": ApprovalStatus.APPROVED,
            "rejected": ApprovalStatus.REJECTED,
            "modified": ApprovalStatus.MODIFIED
        }
        approval_status = status_map.get(status, ApprovalStatus.REJECTED)

        # Create response
        response = HITLApprovalResponse(
            checkpoint_id=approval_id,
            status=approval_status,
            user_feedback=user_feedback,
            modifications=modifications,
            approved_at=datetime.utcnow()
        )

        # Store in database
        try:
            checkpointer = await get_postgres_checkpointer()
            await checkpointer.respond_to_approval(
                approval_id=approval_id,
                status=status,
                response_data={
                    "user_feedback": user_feedback,
                    "modifications": modifications
                },
                user_id=user_id
            )
        except Exception as e:
            logger.error("hitl_db_response_failed", error=str(e))

        # Resolve waiting future
        if approval_id in self._pending_responses:
            self._pending_responses[approval_id].set_result(response)

        # Publish to Redis for other instances
        if self._redis:
            try:
                await self._redis.publish("hitl_approvals", json.dumps({
                    "type": "approval_response",
                    "approval_id": approval_id,
                    "response": {
                        "status": status,
                        "user_feedback": user_feedback,
                        "modifications": modifications
                    }
                }))
            except Exception as e:
                logger.error("hitl_redis_response_publish_failed", error=str(e))

        logger.info(
            "hitl_approval_handled",
            approval_id=approval_id,
            status=status
        )

    async def _handle_approval_response(
        self,
        approval_id: str,
        response: Dict[str, Any]
    ):
        """Handle approval response from Redis pub/sub"""
        status_map = {
            "approved": ApprovalStatus.APPROVED,
            "rejected": ApprovalStatus.REJECTED,
            "modified": ApprovalStatus.MODIFIED
        }

        approval_response = HITLApprovalResponse(
            checkpoint_id=approval_id,
            status=status_map.get(response["status"], ApprovalStatus.REJECTED),
            user_feedback=response.get("user_feedback"),
            modifications=response.get("modifications"),
            approved_at=datetime.utcnow()
        )

        # Resolve waiting future
        if approval_id in self._pending_responses:
            self._pending_responses[approval_id].set_result(approval_response)

    async def heartbeat(self, tenant_id: str, user_id: str):
        """Update heartbeat timestamp for connection"""
        if tenant_id in self._connections:
            if user_id in self._connections[tenant_id]:
                self._connections[tenant_id][user_id].last_heartbeat = datetime.utcnow()

    async def cleanup_stale_connections(self):
        """Remove stale connections that haven't sent heartbeat"""
        now = datetime.utcnow()
        timeout = timedelta(seconds=self.connection_timeout)

        stale = []
        for tenant_id, users in self._connections.items():
            for user_id, conn in users.items():
                if now - conn.last_heartbeat > timeout:
                    stale.append((tenant_id, user_id))

        for tenant_id, user_id in stale:
            logger.info(
                "hitl_stale_connection_removed",
                tenant_id=tenant_id[:8],
                user_id=user_id[:8]
            )
            await self.disconnect(tenant_id, user_id)

    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        total_connections = sum(
            len(users) for users in self._connections.values()
        )

        return {
            "total_connections": total_connections,
            "tenants": len(self._connections),
            "pending_approvals": len(self._pending_responses)
        }

    async def cleanup(self):
        """Cleanup all resources"""
        # Cancel Redis subscriber
        if self._pubsub_task:
            self._pubsub_task.cancel()
            try:
                await self._pubsub_task
            except asyncio.CancelledError:
                pass

        # Close Redis connection
        if self._redis:
            await self._redis.close()

        # Clear connections
        self._connections.clear()
        self._pending_responses.clear()

        logger.info("hitl_connection_manager_cleaned_up")


# ============================================================================
# ENHANCED HITL SERVICE
# ============================================================================

class EnhancedHITLService:
    """
    Enhanced HITL service with WebSocket and PostgreSQL integration.

    Extends the base HITLService with:
    - Real-time WebSocket approvals
    - PostgreSQL persistence
    - Redis pub/sub for multi-instance
    - Automatic timeout handling
    """

    def __init__(
        self,
        enabled: bool = True,
        safety_level: HITLSafetyLevel = HITLSafetyLevel.BALANCED,
        timeout_seconds: int = 3600
    ):
        self.enabled = enabled
        self.safety_level = safety_level
        self.timeout_seconds = timeout_seconds

        self.connection_manager = HITLConnectionManager()

    async def initialize(self):
        """Initialize enhanced HITL service"""
        await self.connection_manager.initialize()

        # Ensure checkpointer is ready
        await get_postgres_checkpointer()

        logger.info(
            "enhanced_hitl_service_initialized",
            enabled=self.enabled,
            safety_level=self.safety_level.value
        )

    async def request_approval(
        self,
        checkpoint_type: HITLCheckpoint,
        request_data: Dict[str, Any],
        session_id: str,
        tenant_id: str,
        user_id: Optional[str] = None
    ) -> HITLApprovalResponse:
        """
        Request HITL approval with WebSocket notification.

        Args:
            checkpoint_type: Type of checkpoint
            request_data: Approval request details
            session_id: Workflow session ID
            tenant_id: Tenant UUID
            user_id: Optional user UUID

        Returns:
            Approval response
        """
        if not self.enabled:
            return self._auto_approve(checkpoint_type.value)

        # Check if auto-approval is appropriate
        if self._should_auto_approve(checkpoint_type, request_data):
            return self._auto_approve(checkpoint_type.value)

        # Create approval in database
        checkpointer = await get_postgres_checkpointer()
        approval_id = await checkpointer.create_hitl_approval(
            checkpoint_id=f"{checkpoint_type.value}_{session_id}",
            thread_id=session_id,
            tenant_id=tenant_id,
            checkpoint_type=checkpoint_type.value,
            request_data=request_data,
            user_id=user_id,
            expires_in_seconds=self.timeout_seconds
        )

        # Broadcast to WebSocket connections
        await self.connection_manager.broadcast_approval_request(
            tenant_id=tenant_id,
            approval_id=approval_id,
            checkpoint_type=checkpoint_type.value,
            request_data=request_data,
            thread_id=session_id
        )

        # Wait for response
        response = await self.connection_manager.wait_for_approval(
            approval_id=approval_id,
            timeout_seconds=self.timeout_seconds
        )

        return response or self._auto_approve(checkpoint_type.value)

    def _should_auto_approve(
        self,
        checkpoint_type: HITLCheckpoint,
        request_data: Dict[str, Any]
    ) -> bool:
        """Determine if checkpoint should be auto-approved"""
        if self.safety_level == HITLSafetyLevel.MINIMAL:
            # Only require approval for critical decisions
            return checkpoint_type != HITLCheckpoint.CRITICAL_DECISION

        if self.safety_level == HITLSafetyLevel.BALANCED:
            # Auto-approve safe tool executions and artifacts
            if checkpoint_type == HITLCheckpoint.ARTIFACT_GENERATION:
                return True

            if checkpoint_type == HITLCheckpoint.TOOL_EXECUTION:
                # Check if tools are safe (read-only)
                tools = request_data.get("tools", [])
                safe_tools = {"web_search", "database_query", "document_parser", "rag_search"}
                has_side_effects = request_data.get("has_side_effects", False)

                if not has_side_effects:
                    all_safe = all(t.get("name") in safe_tools for t in tools)
                    if all_safe:
                        return True

        # Conservative: never auto-approve
        return False

    def _auto_approve(self, checkpoint_type: str) -> HITLApprovalResponse:
        """Create auto-approval response"""
        return HITLApprovalResponse(
            checkpoint_id=f"auto_{checkpoint_type}_{datetime.utcnow().timestamp()}",
            status=ApprovalStatus.APPROVED,
            user_feedback="Auto-approved based on safety level",
            approved_at=datetime.utcnow()
        )

    async def cleanup(self):
        """Cleanup HITL service resources"""
        await self.connection_manager.cleanup()


# ============================================================================
# FACTORY
# ============================================================================

_hitl_service: Optional[EnhancedHITLService] = None


async def get_enhanced_hitl_service() -> EnhancedHITLService:
    """Get or create enhanced HITL service singleton"""
    global _hitl_service

    if _hitl_service is None:
        _hitl_service = EnhancedHITLService()
        await _hitl_service.initialize()

    return _hitl_service


async def close_hitl_service():
    """Close HITL service"""
    global _hitl_service

    if _hitl_service:
        await _hitl_service.cleanup()
        _hitl_service = None
