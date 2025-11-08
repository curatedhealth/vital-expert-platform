"""
Minimal AI Engine Server for Testing Metrics API
"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import the metrics API router
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from api.metrics_api import metrics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler"""
    print("🚀 AI Engine Metrics API starting...")
    yield
    print("🛑 AI Engine Metrics API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="VITAL AI Engine - Metrics API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include metrics router
app.include_router(metrics_router)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Engine Metrics API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "VITAL AI Engine Metrics API",
        "docs": "/docs",
        "health": "/health",
        "metrics": "/api/metrics/*"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

