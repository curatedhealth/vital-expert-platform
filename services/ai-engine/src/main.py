"""
VITAL Path AI Services - FastAPI Backend
Medical AI Agent Orchestration with LangChain
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables FIRST
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / ".env.local", override=True)

# Initialize Sentry and logging
from api.config import initialize_sentry, initialize_logging
initialize_sentry()
initialize_logging()

# Import application components
from api.app_factory import create_app
from api.middleware.setup import setup_middleware
from api.routes.register import register_routes
from api.lifespan import lifespan

# Create and configure application
app = create_app(lifespan=lifespan)
setup_middleware(app)
register_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
        log_level="info"
    )
