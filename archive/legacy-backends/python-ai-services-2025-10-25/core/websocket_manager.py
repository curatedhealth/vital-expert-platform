"""
WebSocket Manager for VITAL Path AI Services
Handles real-time agent communication and system monitoring
"""

import asyncio
import json
import uuid
from typing import Dict, List, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
import structlog

logger = structlog.get_logger()

class WebSocketManager:
    """Manages WebSocket connections for agent communication and monitoring"""
    
    def __init__(self):
        # Agent-specific connections
        self.agent_connections: Dict[str, Set[WebSocket]] = {}
        
        # Monitoring connections
        self.monitoring_connections: Set[WebSocket] = set()
        
        # Connection metadata
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        
        # Message queues for each agent
        self.agent_message_queues: Dict[str, asyncio.Queue] = {}
        
        # System status
        self.system_status = {
            "active_agents": 0,
            "total_connections": 0,
            "last_update": None
        }

    async def connect(self, websocket: WebSocket, agent_id: str):
        """Connect a WebSocket to a specific agent"""
        try:
            await websocket.accept()
            
            # Add to agent connections
            if agent_id not in self.agent_connections:
                self.agent_connections[agent_id] = set()
                self.agent_message_queues[agent_id] = asyncio.Queue()
            
            self.agent_connections[agent_id].add(websocket)
            
            # Store connection metadata
            connection_id = str(uuid.uuid4())
            self.connection_metadata[websocket] = {
                "connection_id": connection_id,
                "agent_id": agent_id,
                "connected_at": asyncio.get_event_loop().time(),
                "message_count": 0
            }
            
            # Update system status
            self.system_status["active_agents"] = len(self.agent_connections)
            self.system_status["total_connections"] = sum(len(conns) for conns in self.agent_connections.values())
            self.system_status["last_update"] = asyncio.get_event_loop().time()
            
            logger.info(f"✅ WebSocket connected to agent {agent_id}", 
                       connection_id=connection_id,
                       total_connections=len(self.agent_connections[agent_id]))
            
            # Send welcome message
            welcome_message = {
                "type": "connection_established",
                "agent_id": agent_id,
                "connection_id": connection_id,
                "timestamp": asyncio.get_event_loop().time()
            }
            await self.send_to_websocket(websocket, welcome_message)
            
        except Exception as e:
            logger.error(f"❌ Failed to connect WebSocket to agent {agent_id}: {e}")
            raise

    async def connect_monitoring(self, websocket: WebSocket):
        """Connect a WebSocket for system monitoring"""
        try:
            await websocket.accept()
            
            self.monitoring_connections.add(websocket)
            
            # Store connection metadata
            connection_id = str(uuid.uuid4())
            self.connection_metadata[websocket] = {
                "connection_id": connection_id,
                "type": "monitoring",
                "connected_at": asyncio.get_event_loop().time(),
                "message_count": 0
            }
            
            logger.info(f"✅ Monitoring WebSocket connected", 
                       connection_id=connection_id,
                       total_monitoring_connections=len(self.monitoring_connections))
            
            # Send initial system status
            await self.send_system_status(websocket)
            
        except Exception as e:
            logger.error(f"❌ Failed to connect monitoring WebSocket: {e}")
            raise

    async def disconnect(self, websocket: WebSocket, agent_id: str):
        """Disconnect a WebSocket from an agent"""
        try:
            if agent_id in self.agent_connections:
                self.agent_connections[agent_id].discard(websocket)
                
                # Remove empty agent connection sets
                if not self.agent_connections[agent_id]:
                    del self.agent_connections[agent_id]
                    if agent_id in self.agent_message_queues:
                        del self.agent_message_queues[agent_id]
            
            # Remove connection metadata
            if websocket in self.connection_metadata:
                del self.connection_metadata[websocket]
            
            # Update system status
            self.system_status["active_agents"] = len(self.agent_connections)
            self.system_status["total_connections"] = sum(len(conns) for conns in self.agent_connections.values())
            self.system_status["last_update"] = asyncio.get_event_loop().time()
            
            logger.info(f"✅ WebSocket disconnected from agent {agent_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to disconnect WebSocket from agent {agent_id}: {e}")

    async def disconnect_monitoring(self, websocket: WebSocket):
        """Disconnect a monitoring WebSocket"""
        try:
            self.monitoring_connections.discard(websocket)
            
            # Remove connection metadata
            if websocket in self.connection_metadata:
                del self.connection_metadata[websocket]
            
            logger.info(f"✅ Monitoring WebSocket disconnected")
            
        except Exception as e:
            logger.error(f"❌ Failed to disconnect monitoring WebSocket: {e}")

    async def send_to_agent(self, agent_id: str, message: Dict[str, Any]):
        """Send message to all connections for a specific agent"""
        if agent_id not in self.agent_connections:
            logger.warning(f"⚠️ No connections found for agent {agent_id}")
            return
        
        message["timestamp"] = asyncio.get_event_loop().time()
        
        # Send to all connections for this agent
        disconnected_connections = set()
        for websocket in self.agent_connections[agent_id]:
            try:
                await self.send_to_websocket(websocket, message)
                
                # Update message count
                if websocket in self.connection_metadata:
                    self.connection_metadata[websocket]["message_count"] += 1
                    
            except WebSocketDisconnect:
                disconnected_connections.add(websocket)
            except Exception as e:
                logger.error(f"❌ Failed to send message to agent {agent_id}: {e}")
                disconnected_connections.add(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected_connections:
            await self.disconnect(websocket, agent_id)

    async def broadcast_to_agent(self, agent_id: str, message: Dict[str, Any]):
        """Broadcast message to all connections for a specific agent"""
        await self.send_to_agent(agent_id, message)

    async def send_system_status(self, websocket: WebSocket):
        """Send current system status to a monitoring connection"""
        try:
            status_message = {
                "type": "system_status",
                "data": self.system_status,
                "timestamp": asyncio.get_event_loop().time()
            }
            await self.send_to_websocket(websocket, status_message)
        except Exception as e:
            logger.error(f"❌ Failed to send system status: {e}")

    async def broadcast_system_status(self):
        """Broadcast system status to all monitoring connections"""
        if not self.monitoring_connections:
            return
        
        status_message = {
            "type": "system_status",
            "data": self.system_status,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        disconnected_connections = set()
        for websocket in self.monitoring_connections:
            try:
                await self.send_to_websocket(websocket, status_message)
            except WebSocketDisconnect:
                disconnected_connections.add(websocket)
            except Exception as e:
                logger.error(f"❌ Failed to broadcast system status: {e}")
                disconnected_connections.add(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected_connections:
            await self.disconnect_monitoring(websocket)

    async def send_to_websocket(self, websocket: WebSocket, message: Dict[str, Any]):
        """Send message to a specific WebSocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"❌ Failed to send message to WebSocket: {e}")
            raise

    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            "active_agents": len(self.agent_connections),
            "total_connections": sum(len(conns) for conns in self.agent_connections.values()),
            "monitoring_connections": len(self.monitoring_connections),
            "agent_connections": {
                agent_id: len(connections) 
                for agent_id, connections in self.agent_connections.items()
            },
            "connection_metadata": {
                conn_id: metadata 
                for conn_id, metadata in self.connection_metadata.items()
            }
        }

    async def cleanup(self):
        """Clean up all connections"""
        try:
            # Close all agent connections
            for agent_id, connections in self.agent_connections.items():
                for websocket in connections:
                    try:
                        await websocket.close()
                    except:
                        pass
            
            # Close all monitoring connections
            for websocket in self.monitoring_connections:
                try:
                    await websocket.close()
                except:
                    pass
            
            # Clear all data structures
            self.agent_connections.clear()
            self.monitoring_connections.clear()
            self.connection_metadata.clear()
            self.agent_message_queues.clear()
            
            logger.info("✅ WebSocket manager cleanup complete")
            
        except Exception as e:
            logger.error(f"❌ Failed to cleanup WebSocket manager: {e}")
