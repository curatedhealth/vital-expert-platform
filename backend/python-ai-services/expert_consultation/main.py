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

# Global service instances
session_manager = None
redis_manager = None
execution_controller = None
execution_analyzer = None

# Import routes
from routes import consultation, streaming, control, sessions, analytics, modes, health
app.include_router(consultation.router, prefix="/expert", tags=["consultation"])
app.include_router(streaming.router, prefix="/expert/stream", tags=["streaming"])
app.include_router(control.router, prefix="/expert/control", tags=["control"])
app.include_router(sessions.router, prefix="/expert/sessions", tags=["sessions"])
app.include_router(analytics.router, prefix="/expert/analytics", tags=["analytics"])
app.include_router(modes.router, prefix="/expert/modes", tags=["modes"])
app.include_router(health.router, tags=["health"])

# Set service instances for health checks
from routes.health import set_service_instances

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global session_manager, redis_manager, execution_controller, execution_analyzer
    
    # Import here to avoid circular imports
    from session.session_manager import SessionManager
    from redis.redis_manager import RedisManager
    from execution.execution_controller import ExecutionController
    from analytics.execution_analyzer import ExecutionAnalyzer
    
    # Initialize core services
    session_manager = SessionManager(os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/vital"))
    redis_manager = RedisManager(os.getenv("REDIS_URL", "redis://localhost:6379"))
    execution_analyzer = ExecutionAnalyzer(session_manager, redis_manager)
    
    # Connect to Redis
    await redis_manager.connect()
    
    # Initialize execution controller (will be set up with streamer later)
    execution_controller = ExecutionController(session_manager, redis_manager, None)
    
    # Set service instances for health checks
    set_service_instances(session_manager, redis_manager, execution_controller, execution_analyzer)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
