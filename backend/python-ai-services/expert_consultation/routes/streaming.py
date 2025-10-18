from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import json
import asyncio

from ..streaming.reasoning_streamer import ReasoningStreamer

router = APIRouter()

# Global streamer instance (in production, use dependency injection)
streamer = ReasoningStreamer()

@router.get("/{session_id}")
async def stream_consultation(session_id: str):
    """Stream consultation reasoning in real-time"""
    try:
        async def generate_stream():
            async for event in streamer.subscribe(session_id):
                # Format as Server-Sent Events
                yield f"data: {json.dumps(event)}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming failed: {str(e)}")

@router.post("/{session_id}/subscribe")
async def subscribe_to_stream(session_id: str):
    """Subscribe to consultation stream"""
    try:
        # In production, validate session exists
        return {"message": f"Subscribed to stream for session {session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription failed: {str(e)}")

@router.delete("/{session_id}/unsubscribe")
async def unsubscribe_from_stream(session_id: str):
    """Unsubscribe from consultation stream"""
    try:
        await streamer.unsubscribe(session_id)
        return {"message": f"Unsubscribed from stream for session {session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unsubscription failed: {str(e)}")

@router.get("/active")
async def get_active_streams():
    """Get list of active streams"""
    try:
        active_streams = streamer.get_active_streams()
        return {
            "active_streams": active_streams,
            "count": len(active_streams)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get active streams: {str(e)}")
