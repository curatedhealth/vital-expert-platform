"""
VITAL Path API Server
FastAPI server configuration and startup for the healthcare AI platform
"""

import os
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)
from fastapi.staticfiles import StaticFiles
import redis.asyncio as redis
from datetime import datetime

from .gateway import create_gateway, get_gateway
from .integrations import integration_manager, IntegrationConfig, IntegrationType, AuthenticationType, DataFormat
from ..core.vital_path_platform import VitalPathPlatform

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class APIServer:
    def __init__(self):
        self.app = None
        self.gateway = None
        self.platform = None
        self.redis_client = None
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from environment variables"""
        return {
            "SECRET_KEY": os.getenv("SECRET_KEY", "vital-path-secret-key-change-in-production"),
            "REDIS_URL": os.getenv("REDIS_URL", "redis://localhost:6379"),
            "DATABASE_URL": os.getenv("DATABASE_URL", "postgresql://localhost:5432/vital_path"),
            "HOST": os.getenv("HOST", "0.0.0.0"),
            "PORT": int(os.getenv("PORT", 8000)),
            "ENVIRONMENT": os.getenv("ENVIRONMENT", "development"),
            "DEBUG": os.getenv("DEBUG", "false").lower() == "true",
            "CORS_ORIGINS": os.getenv("CORS_ORIGINS", "*").split(","),
            "TRUSTED_HOSTS": os.getenv("TRUSTED_HOSTS", "*").split(","),
            "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
            "WORKERS": int(os.getenv("WORKERS", 1)),
            "RELOAD": os.getenv("RELOAD", "false").lower() == "true",
        }

    @asynccontextmanager
    async def lifespan(self, app: FastAPI):
        """FastAPI lifespan events"""
        # Startup
        logger.info("Starting VITAL Path API Server...")

        try:
            # Initialize Redis connection
            self.redis_client = redis.from_url(self.config["REDIS_URL"])
            await self.redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            self.redis_client = None

        # Initialize VITAL Path Platform
        try:
            self.platform = VitalPathPlatform()
            await self.platform.initialize()
            logger.info("VITAL Path Platform initialized")
        except Exception as e:
            logger.error(f"Platform initialization failed: {e}")

        # Initialize API Gateway
        try:
            self.gateway = create_gateway(
                secret_key=self.config["SECRET_KEY"],
                redis_url=self.config["REDIS_URL"]
            )
            if self.platform:
                self.gateway.set_platform_client(self.platform)
            logger.info("API Gateway initialized")
        except Exception as e:
            logger.error(f"Gateway initialization failed: {e}")

        # Setup default integrations
        await self._setup_default_integrations()

        logger.info("VITAL Path API Server startup completed")

        yield

        # Shutdown
        logger.info("Shutting down VITAL Path API Server...")

        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis connection closed")

        if integration_manager:
            await integration_manager.close_all_integrations()
            logger.info("Integrations closed")

        if self.platform:
            await self.platform.cleanup()
            logger.info("Platform cleanup completed")

        logger.info("VITAL Path API Server shutdown completed")

    async def _setup_default_integrations(self):
        """Setup default healthcare system integrations"""
        default_integrations = [
            IntegrationConfig(
                integration_id="fhir_default",
                name="Default FHIR Server",
                type=IntegrationType.FHIR,
                endpoint_url=os.getenv("FHIR_ENDPOINT", "http://localhost:8080/fhir"),
                auth_type=AuthenticationType.API_KEY,
                credentials={
                    "api_key": os.getenv("FHIR_API_KEY", "default-api-key")
                },
                data_format=DataFormat.FHIR,
                active=os.getenv("FHIR_ENABLED", "false").lower() == "true"
            ),
            IntegrationConfig(
                integration_id="ehr_default",
                name="Default EHR System",
                type=IntegrationType.EHR,
                endpoint_url=os.getenv("EHR_ENDPOINT", "http://localhost:8081/api"),
                auth_type=AuthenticationType.BASIC,
                credentials={
                    "username": os.getenv("EHR_USERNAME", "vital_path"),
                    "password": os.getenv("EHR_PASSWORD", "password")
                },
                data_format=DataFormat.JSON,
                active=os.getenv("EHR_ENABLED", "false").lower() == "true"
            ),
            IntegrationConfig(
                integration_id="hl7_default",
                name="Default HL7 Interface",
                type=IntegrationType.HL7,
                endpoint_url=os.getenv("HL7_ENDPOINT", "http://localhost:8082/hl7"),
                auth_type=AuthenticationType.BASIC,
                credentials={
                    "username": os.getenv("HL7_USERNAME", "vital_path"),
                    "password": os.getenv("HL7_PASSWORD", "password")
                },
                data_format=DataFormat.HL7,
                active=os.getenv("HL7_ENABLED", "false").lower() == "true"
            )
        ]

        for config in default_integrations:
            if config.active:
                try:
                    success = await integration_manager.add_integration(config)
                    if success:
                        logger.info(f"Default integration added: {config.name}")
                    else:
                        logger.warning(f"Failed to add default integration: {config.name}")
                except Exception as e:
                    logger.error(f"Error adding default integration {config.name}: {e}")

    def create_app(self) -> FastAPI:
        """Create and configure FastAPI application"""
        app = FastAPI(
            title="VITAL Path Healthcare AI Platform API",
            description="Comprehensive healthcare AI platform with clinical validation, agent orchestration, and system integration",
            version="1.0.0",
            docs_url="/docs" if self.config["DEBUG"] else None,
            redoc_url="/redoc" if self.config["DEBUG"] else None,
            openapi_url="/openapi.json" if self.config["DEBUG"] else None,
            lifespan=self.lifespan
        )

        # Add middleware
        self._setup_middleware(app)

        # Add custom routes
        self._setup_custom_routes(app)

        # Include gateway routes
        if self.gateway:
            app.mount("/api", self.gateway.app)

        self.app = app
        return app

    def _setup_middleware(self, app: FastAPI):
        """Setup FastAPI middleware"""
        # CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=self.config["CORS_ORIGINS"],
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        )

        # Trusted host middleware
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=self.config["TRUSTED_HOSTS"]
        )

        # Request logging middleware
        @app.middleware("http")
        async def log_requests(request, call_next):
            start_time = datetime.now()

            response = await call_next(request)

            process_time = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Request: {request.method} {request.url} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.4f}s"
            )

            return response

    def _setup_custom_routes(self, app: FastAPI):
        """Setup custom API routes"""

        @app.get("/")
        async def root():
            return {
                "message": "VITAL Path Healthcare AI Platform API",
                "version": "1.0.0",
                "status": "running",
                "timestamp": datetime.now(),
                "docs_url": "/docs" if self.config["DEBUG"] else None
            }

        @app.get("/health")
        async def health_check():
            """Comprehensive health check endpoint"""
            health_status = {
                "status": "healthy",
                "timestamp": datetime.now(),
                "services": {}
            }

            # Check Redis
            if self.redis_client:
                try:
                    await self.redis_client.ping()
                    health_status["services"]["redis"] = "healthy"
                except Exception as e:
                    health_status["services"]["redis"] = f"unhealthy: {e}"
                    health_status["status"] = "degraded"
            else:
                health_status["services"]["redis"] = "not_configured"

            # Check Platform
            if self.platform:
                try:
                    # You could add a health check method to the platform
                    health_status["services"]["platform"] = "healthy"
                except Exception as e:
                    health_status["services"]["platform"] = f"unhealthy: {e}"
                    health_status["status"] = "degraded"
            else:
                health_status["services"]["platform"] = "not_initialized"

            # Check Integrations
            try:
                integrations = await integration_manager.list_integrations()
                active_count = sum(1 for i in integrations if i["active"])
                health_status["services"]["integrations"] = {
                    "total": len(integrations),
                    "active": active_count,
                    "status": "healthy" if active_count > 0 else "no_active_integrations"
                }
            except Exception as e:
                health_status["services"]["integrations"] = f"error: {e}"
                health_status["status"] = "degraded"

            return health_status

        @app.get("/system/info")
        async def system_info():
            """System information endpoint"""
            return {
                "environment": self.config["ENVIRONMENT"],
                "debug": self.config["DEBUG"],
                "platform_initialized": self.platform is not None,
                "gateway_initialized": self.gateway is not None,
                "redis_connected": self.redis_client is not None,
                "integrations_available": len(await integration_manager.list_integrations()),
                "timestamp": datetime.now()
            }

        @app.get("/integrations")
        async def list_integrations():
            """List all configured integrations"""
            return await integration_manager.list_integrations()

        @app.get("/integrations/{integration_id}/status")
        async def get_integration_status(integration_id: str):
            """Get status of a specific integration"""
            return await integration_manager.get_integration_status(integration_id)

        # Custom error handlers
        @app.exception_handler(500)
        async def internal_server_error(request, exc):
            logger.error(f"Internal server error: {exc}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": "An unexpected error occurred",
                    "timestamp": datetime.now().isoformat()
                }
            )

        @app.exception_handler(404)
        async def not_found_error(request, exc):
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Not found",
                    "message": "The requested resource was not found",
                    "timestamp": datetime.now().isoformat()
                }
            )

    def run(self):
        """Run the API server"""
        uvicorn.run(
            "src.api.server:create_server",
            host=self.config["HOST"],
            port=self.config["PORT"],
            workers=self.config["WORKERS"] if not self.config["DEBUG"] else 1,
            reload=self.config["RELOAD"],
            log_level=self.config["LOG_LEVEL"].lower(),
            access_log=True
        )

# Global server instance
server = APIServer()

def create_server() -> FastAPI:
    """Factory function to create the FastAPI app"""
    return server.create_app()

if __name__ == "__main__":
    # Run the server directly
    server.run()