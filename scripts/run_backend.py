#!/usr/bin/env python3
"""
VITAL Path Backend Server Entry Point
Runs the FastAPI server with proper module imports and production configuration
"""
import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

if __name__ == "__main__":
    logger.info("Starting VITAL Path Backend Server...")

    try:
        # Import the server module
        from src.api.server import server

        logger.info("Server module loaded successfully")
        logger.info("Server will start on http://0.0.0.0:8000")
        logger.info("API Documentation: http://0.0.0.0:8000/docs")
        logger.info("Health Check: http://0.0.0.0:8000/health")

        # Run the server
        server.run()

    except ImportError as e:
        logger.error(f"Import error: {e}")
        logger.info("Falling back to simplified API server...")

        # Fallback: Start a simple FastAPI server without complex dependencies
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from datetime import datetime
        import uvicorn

        app = FastAPI(
            title="VITAL API Server (Simplified Mode)",
            version="1.0.0",
            description="Fallback mode - full features unavailable"
        )

        # CORS configuration
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000", "http://localhost:3001"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @app.get("/")
        async def root():
            return {
                "status": "ok",
                "message": "VITAL API Server is running in simplified mode",
                "timestamp": datetime.now().isoformat()
            }

        @app.get("/health")
        async def health():
            return {
                "status": "healthy",
                "mode": "simplified",
                "version": "1.0.0",
                "timestamp": datetime.now().isoformat()
            }

        # Run the simplified server
        logger.info("Starting VITAL API Server (Simplified Mode) on http://0.0.0.0:8000")
        logger.info("Health check: http://0.0.0.0:8000/health")

        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_level="info"
        )

    except Exception as e:
        logger.error(f"Fatal error starting server: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
