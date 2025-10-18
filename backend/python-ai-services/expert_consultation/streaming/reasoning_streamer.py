from typing import Dict, Any, AsyncIterator
from langgraph.checkpoint.memory import MemorySaver
import asyncio
import json
from datetime import datetime

class ReasoningStreamer:
    """Stream reasoning steps in real-time"""
    
    def __init__(self, checkpointer=None):
        self.checkpointer = checkpointer or MemorySaver()
        self.active_streams: Dict[str, asyncio.Queue] = {}
        self.subscribers: Dict[str, list] = {}
    
    async def stream_reasoning_step(self, session_id: str, step: Dict[str, Any]):
        """Stream step to all connected clients"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put({
                "type": "reasoning_step",
                "data": step,
                "timestamp": datetime.now().isoformat()
            })
    
    async def stream_phase_change(self, session_id: str, phase: str, metadata: Dict[str, Any] = None):
        """Stream phase change event"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put({
                "type": "phase_change",
                "phase": phase,
                "metadata": metadata or {},
                "timestamp": datetime.now().isoformat()
            })
    
    async def stream_cost_update(self, session_id: str, cost_data: Dict[str, Any]):
        """Stream cost update"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put({
                "type": "cost_update",
                "data": cost_data,
                "timestamp": datetime.now().isoformat()
            })
    
    async def stream_execution_status(self, session_id: str, status: Dict[str, Any]):
        """Stream execution status update"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put({
                "type": "execution_status",
                "data": status,
                "timestamp": datetime.now().isoformat()
            })
    
    async def stream_intervention_request(self, session_id: str, intervention: Dict[str, Any]):
        """Stream user intervention request"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put({
                "type": "intervention_request",
                "data": intervention,
                "timestamp": datetime.now().isoformat()
            })
    
    async def stream_execution_complete(self, session_id: str, final_result: Dict[str, Any]):
        """Stream execution completion"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put({
                "type": "execution_complete",
                "data": final_result,
                "timestamp": datetime.now().isoformat()
            })
    
    async def subscribe(self, session_id: str) -> AsyncIterator[Dict]:
        """Subscribe to reasoning stream"""
        queue = asyncio.Queue()
        self.active_streams[session_id] = queue
        
        try:
            while True:
                event = await queue.get()
                yield event
                if event.get("type") == "execution_complete":
                    break
        finally:
            if session_id in self.active_streams:
                del self.active_streams[session_id]
    
    async def unsubscribe(self, session_id: str):
        """Unsubscribe from stream"""
        if session_id in self.active_streams:
            del self.active_streams[session_id]
    
    def get_active_streams(self) -> list:
        """Get list of active stream session IDs"""
        return list(self.active_streams.keys())
    
    async def broadcast_to_session(self, session_id: str, event: Dict[str, Any]):
        """Broadcast event to specific session"""
        if session_id in self.active_streams:
            await self.active_streams[session_id].put(event)
    
    async def broadcast_to_all(self, event: Dict[str, Any]):
        """Broadcast event to all active streams"""
        for session_id in self.active_streams:
            await self.broadcast_to_session(session_id, event)
