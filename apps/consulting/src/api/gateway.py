"""
VITAL Path API Gateway Implementation
Comprehensive FastAPI gateway for external integrations and service orchestration
"""

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import logging
from dataclasses import dataclass, asdict
import jwt
import redis
from contextlib import asynccontextmanager
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
import time
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

class APIVersion(str, Enum):
    V1 = "v1"
    V2 = "v2"
    BETA = "beta"

class RequestType(str, Enum):
    MEDICAL_QUERY = "medical_query"
    DRUG_INTERACTION = "drug_interaction"
    DIAGNOSIS_ASSISTANCE = "diagnosis_assistance"
    TREATMENT_RECOMMENDATION = "treatment_recommendation"
    CLINICAL_VALIDATION = "clinical_validation"
    WORKFLOW_EXECUTION = "workflow_execution"
    AGENT_CONSULTATION = "agent_consultation"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class WebSocketEventType(str, Enum):
    REQUEST_STATUS = "request_status"
    VALIDATION_UPDATE = "validation_update"
    WORKFLOW_PROGRESS = "workflow_progress"
    AGENT_RESPONSE = "agent_response"
    SYSTEM_ALERT = "system_alert"

@dataclass
class APIRequest:
    request_id: str
    request_type: RequestType
    priority: Priority
    user_id: str
    session_id: str
    content: Dict[str, Any]
    metadata: Dict[str, Any]
    timestamp: datetime
    api_version: APIVersion
    client_info: Dict[str, str]

@dataclass
class APIResponse:
    request_id: str
    status: str
    data: Optional[Dict[str, Any]]
    error: Optional[str]
    processing_time: float
    timestamp: datetime
    metadata: Dict[str, Any]
    warnings: List[str]

class APIGatewayRequest(BaseModel):
    request_type: RequestType
    priority: Priority = Priority.MEDIUM
    content: Dict[str, Any]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    session_id: Optional[str] = None
    api_version: APIVersion = APIVersion.V1

class APIGatewayResponse(BaseModel):
    request_id: str
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: float
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)

class WebSocketMessage(BaseModel):
    event_type: WebSocketEventType
    request_id: str
    data: Dict[str, Any]
    timestamp: datetime

class RateLimitConfig:
    def __init__(self):
        self.requests_per_minute = {
            "free": 10,
            "basic": 50,
            "premium": 200,
            "enterprise": 1000
        }
        self.requests_per_hour = {
            "free": 100,
            "basic": 500,
            "premium": 2000,
            "enterprise": 10000
        }

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket connection established for client: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket connection closed for client: {client_id}")

    async def send_message(self, client_id: str, message: WebSocketMessage):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message.model_dump_json())
            except Exception as e:
                logger.error(f"Failed to send message to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast(self, message: WebSocketMessage):
        for client_id, connection in self.active_connections.copy().items():
            try:
                await connection.send_text(message.model_dump_json())
            except Exception as e:
                logger.error(f"Failed to broadcast to {client_id}: {e}")
                self.disconnect(client_id)

class AuthenticationManager:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.algorithm = "HS256"

    async def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        try:
            payload = jwt.decode(credentials.credentials, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            return payload
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    def create_token(self, user_id: str, user_tier: str, expires_delta: timedelta = None) -> str:
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=24)

        to_encode = {
            "sub": user_id,
            "tier": user_tier,
            "exp": expire,
            "iat": datetime.utcnow(),
            "iss": "vital-path-api"
        }
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

class RateLimiter:
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.rate_limit_config = RateLimitConfig()

    async def check_rate_limit(self, user_id: str, user_tier: str) -> bool:
        current_time = int(time.time())
        minute_key = f"rate_limit:{user_id}:minute:{current_time // 60}"
        hour_key = f"rate_limit:{user_id}:hour:{current_time // 3600}"

        try:
            # Check minute limit
            minute_count = await self.redis_client.incr(minute_key)
            if minute_count == 1:
                await self.redis_client.expire(minute_key, 60)

            if minute_count > self.rate_limit_config.requests_per_minute.get(user_tier, 10):
                return False

            # Check hour limit
            hour_count = await self.redis_client.incr(hour_key)
            if hour_count == 1:
                await self.redis_client.expire(hour_key, 3600)

            if hour_count > self.rate_limit_config.requests_per_hour.get(user_tier, 100):
                return False

            return True

        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            return True  # Allow request if rate limiting fails

class RequestRouter:
    def __init__(self, platform_client):
        self.platform_client = platform_client

    async def route_request(self, api_request: APIRequest) -> APIResponse:
        start_time = time.time()

        try:
            # Convert API request to platform request
            platform_request = self._convert_to_platform_request(api_request)

            # Process through VITAL Path platform
            platform_response = await self.platform_client.process_request(platform_request)

            # Convert platform response to API response
            api_response = self._convert_to_api_response(
                api_request, platform_response, time.time() - start_time
            )

            return api_response

        except Exception as e:
            logger.error(f"Request routing error: {e}")
            return APIResponse(
                request_id=api_request.request_id,
                status="error",
                data=None,
                error=str(e),
                processing_time=time.time() - start_time,
                timestamp=datetime.utcnow(),
                metadata={},
                warnings=[]
            )

    def _convert_to_platform_request(self, api_request: APIRequest):
        # Import here to avoid circular imports
        from ..core.vital_path_platform import PlatformRequest, RequestType as PlatformRequestType

        # Map API request types to platform request types
        type_mapping = {
            RequestType.MEDICAL_QUERY: PlatformRequestType.MEDICAL_QUERY,
            RequestType.DRUG_INTERACTION: PlatformRequestType.DRUG_INTERACTION,
            RequestType.DIAGNOSIS_ASSISTANCE: PlatformRequestType.DIAGNOSIS_ASSISTANCE,
            RequestType.TREATMENT_RECOMMENDATION: PlatformRequestType.TREATMENT_RECOMMENDATION,
            RequestType.CLINICAL_VALIDATION: PlatformRequestType.CLINICAL_VALIDATION,
            RequestType.WORKFLOW_EXECUTION: PlatformRequestType.WORKFLOW_EXECUTION,
            RequestType.AGENT_CONSULTATION: PlatformRequestType.AGENT_CONSULTATION,
        }

        return PlatformRequest(
            request_id=api_request.request_id,
            request_type=type_mapping.get(api_request.request_type),
            user_id=api_request.user_id,
            session_id=api_request.session_id,
            content=api_request.content,
            priority=api_request.priority.value,
            metadata=api_request.metadata,
            timestamp=api_request.timestamp
        )

    def _convert_to_api_response(self, api_request: APIRequest, platform_response, processing_time: float) -> APIResponse:
        return APIResponse(
            request_id=api_request.request_id,
            status=platform_response.status,
            data=platform_response.data,
            error=platform_response.error,
            processing_time=processing_time,
            timestamp=datetime.utcnow(),
            metadata=platform_response.metadata,
            warnings=platform_response.warnings
        )

class APIGateway:
    def __init__(self, secret_key: str, redis_url: str = "redis://localhost:6379"):
        self.app = FastAPI(
            title="VITAL Path API Gateway",
            description="Healthcare AI Platform API Gateway",
            version="1.0.0",
            docs_url="/docs",
            redoc_url="/redoc"
        )

        # Initialize components
        self.auth_manager = AuthenticationManager(secret_key)
        self.connection_manager = ConnectionManager()

        # Initialize Redis for rate limiting
        try:
            import aioredis
            self.redis_client = aioredis.from_url(redis_url)
            self.rate_limiter = RateLimiter(self.redis_client)
        except ImportError:
            logger.warning("Redis not available, rate limiting disabled")
            self.redis_client = None
            self.rate_limiter = None

        # Initialize request router (will be set when platform is available)
        self.request_router = None

        self._setup_middleware()
        self._setup_routes()

    def _setup_middleware(self):
        # CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Configure appropriately for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Trusted host middleware
        self.app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"]  # Configure appropriately for production
        )

    def _setup_routes(self):
        # Health check endpoint
        @self.app.get("/health")
        async def health_check():
            return {"status": "healthy", "timestamp": datetime.utcnow()}

        # Authentication endpoint
        @self.app.post("/auth/token")
        async def create_access_token(user_id: str, user_tier: str = "free"):
            token = self.auth_manager.create_token(user_id, user_tier)
            return {"access_token": token, "token_type": "bearer"}

        # Main API endpoint
        @self.app.post("/api/{version}/process", response_model=APIGatewayResponse)
        async def process_request(
            version: APIVersion,
            request: APIGatewayRequest,
            background_tasks: BackgroundTasks,
            user_data: Dict[str, Any] = Depends(self.auth_manager.verify_token)
        ):
            # Rate limiting
            if self.rate_limiter:
                user_tier = user_data.get("tier", "free")
                if not await self.rate_limiter.check_rate_limit(user_data["sub"], user_tier):
                    raise HTTPException(status_code=429, detail="Rate limit exceeded")

            # Create API request
            api_request = APIRequest(
                request_id=str(uuid.uuid4()),
                request_type=request.request_type,
                priority=request.priority,
                user_id=user_data["sub"],
                session_id=request.session_id or str(uuid.uuid4()),
                content=request.content,
                metadata=request.metadata,
                timestamp=datetime.utcnow(),
                api_version=version,
                client_info={"user_tier": user_data.get("tier", "free")}
            )

            # Route request
            if not self.request_router:
                raise HTTPException(status_code=503, detail="Platform not available")

            api_response = await self.request_router.route_request(api_request)

            # Send WebSocket update
            background_tasks.add_task(
                self._send_websocket_update,
                user_data["sub"],
                api_request.request_id,
                api_response
            )

            return APIGatewayResponse(
                request_id=api_response.request_id,
                status=api_response.status,
                data=api_response.data,
                error=api_response.error,
                processing_time=api_response.processing_time,
                timestamp=api_response.timestamp,
                metadata=api_response.metadata,
                warnings=api_response.warnings
            )

        # WebSocket endpoint
        @self.app.websocket("/ws/{client_id}")
        async def websocket_endpoint(websocket: WebSocket, client_id: str):
            await self.connection_manager.connect(websocket, client_id)
            try:
                while True:
                    data = await websocket.receive_text()
                    # Handle incoming WebSocket messages if needed
                    logger.info(f"Received WebSocket message from {client_id}: {data}")
            except WebSocketDisconnect:
                self.connection_manager.disconnect(client_id)

        # Status endpoint for request tracking
        @self.app.get("/api/{version}/status/{request_id}")
        async def get_request_status(
            version: APIVersion,
            request_id: str,
            user_data: Dict[str, Any] = Depends(self.auth_manager.verify_token)
        ):
            # Implementation would query request status from database/cache
            return {"request_id": request_id, "status": "processing", "progress": 50}

        # Metrics endpoint
        @self.app.get("/metrics")
        async def get_metrics():
            return {
                "active_connections": len(self.connection_manager.active_connections),
                "timestamp": datetime.utcnow()
            }

    async def _send_websocket_update(self, user_id: str, request_id: str, api_response: APIResponse):
        message = WebSocketMessage(
            event_type=WebSocketEventType.REQUEST_STATUS,
            request_id=request_id,
            data={
                "status": api_response.status,
                "processing_time": api_response.processing_time,
                "has_error": api_response.error is not None
            },
            timestamp=datetime.utcnow()
        )
        await self.connection_manager.send_message(user_id, message)

    def set_platform_client(self, platform_client):
        """Set the VITAL Path platform client for request routing"""
        self.request_router = RequestRouter(platform_client)
        logger.info("Platform client configured for API Gateway")

# Gateway instance (will be initialized by main application)
gateway = None

def create_gateway(secret_key: str, redis_url: str = "redis://localhost:6379") -> APIGateway:
    """Create and configure the API Gateway"""
    global gateway
    gateway = APIGateway(secret_key, redis_url)
    return gateway

def get_gateway() -> APIGateway:
    """Get the configured API Gateway instance"""
    if gateway is None:
        raise RuntimeError("API Gateway not initialized. Call create_gateway() first.")
    return gateway