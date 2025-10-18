from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI(
    title="VITAL Expert Consultation Service",
    version="1.0.0",
    description="Autonomous expert consultation with LangGraph"
)

# CORS for Node gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "vital-expert-consultation",
        "version": "1.0.0"
    }

# Basic consultation endpoint
@app.post("/expert/execute")
async def execute_consultation(request: dict):
    """Execute expert consultation - simplified version"""
    try:
        return {
            "session_id": "test-session-123",
            "stream_url": "/expert/stream/test-session-123",
            "status": "started",
            "estimated_cost": 1.50
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start consultation: {str(e)}")

# Basic streaming endpoint
@app.get("/expert/stream/{session_id}")
async def stream_consultation(session_id: str):
    """Stream consultation results - simplified version"""
    def generate():
        yield f"data: {json.dumps({'type': 'reasoning_step', 'data': {'phase': 'think', 'content': 'Starting analysis...'}})}\n\n"
        yield f"data: {json.dumps({'type': 'execution_complete', 'data': {'status': 'completed'}})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/plain")

# Mode management endpoints
@app.post("/expert/modes/sessions/start")
async def start_session(request: dict):
    """Start a new session with specified mode"""
    return {
        "session_id": "test-session-456",
        "interaction_mode": request.get("interaction_mode", "interactive"),
        "agent_mode": request.get("agent_mode", "automatic"),
        "status": "active"
    }

@app.get("/expert/modes/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    return {
        "session_id": session_id,
        "interaction_mode": "interactive",
        "agent_mode": "automatic",
        "status": "active"
    }

@app.post("/expert/modes/sessions/{session_id}/query")
async def process_query(session_id: str, request: dict):
    """Process a query in the current mode"""
    return {
        "session_id": session_id,
        "response": f"Processed query: {request.get('query', 'No query provided')}",
        "status": "completed"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
