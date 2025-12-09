"""
VITAL Path AI Services - L5 Base Tool

Enhanced base class with ToolConfig pattern for 64+ tools.
Supports configuration-driven tool creation with database sync.
Reusable across all services (Ask Expert, Panel, etc.)

Naming Convention:
- Class: L5BaseTool, ToolConfig
- Logs: vital_l5_{tool_slug}_{action}
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional, Union, TypeVar, Generic
from enum import Enum
from datetime import datetime
from functools import wraps
import hashlib
import json
import os
import asyncio
import structlog

logger = structlog.get_logger()

T = TypeVar('T')


# ============================================================================
# ENUMS
# ============================================================================

class ToolTier(Enum):
    """Tool priority tiers."""
    CRITICAL = 1  # Must have - core functionality
    HIGH = 2      # Important - commonly used
    MEDIUM = 3    # Nice to have - specialized use cases


class AdapterType(Enum):
    """Types of tool adapters."""
    REST_API = "rest"
    GRAPHQL = "graphql"
    SDK = "sdk"
    DATABASE = "database"
    LOCAL = "local"
    R_BRIDGE = "r_bridge"
    JAVA_BRIDGE = "java_bridge"


class AuthType(Enum):
    """Authentication types."""
    NONE = "none"
    API_KEY = "api_key"
    BEARER = "bearer"
    OAUTH2 = "oauth2"
    BASIC = "basic"
    LICENSE_KEY = "license_key"


# ============================================================================
# TOOL CONFIG
# ============================================================================

@dataclass
class ToolConfig:
    """
    Configuration for an L5 tool.
    Can be loaded from code or synced from Supabase.
    """
    
    # Identity
    id: str                      # L5-PM, L5-FDA, etc.
    name: str                    # Human-readable name
    slug: str                    # URL-friendly identifier
    description: str = ""        # What the tool does
    
    # Classification
    category: str = "general"    # Domain category
    tier: int = 2                # 1=critical, 2=high, 3=medium
    priority: str = "medium"     # critical, high, medium, low
    
    # API Configuration
    adapter_type: AdapterType = AdapterType.REST_API
    base_url: Optional[str] = None
    auth_type: AuthType = AuthType.NONE
    auth_env_var: Optional[str] = None
    
    # Performance
    rate_limit: int = 10         # requests per second
    timeout: int = 30            # seconds
    max_retries: int = 3
    
    # Cost & Caching
    cost_per_call: float = 0.001
    cache_ttl: int = 3600        # seconds (0 = no cache)
    
    # Behavior
    idempotent: bool = True
    has_side_effects: bool = False
    allowed_failure_rate: float = 0.1
    
    # Metadata
    tags: List[str] = field(default_factory=list)
    vendor: str = ""
    license: str = ""
    documentation_url: str = ""
    
    # Schema (optional - for validation)
    input_schema: Optional[Dict] = None
    output_schema: Optional[Dict] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        d = asdict(self)
        d['adapter_type'] = self.adapter_type.value
        d['auth_type'] = self.auth_type.value
        return d
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ToolConfig':
        """Create from dictionary (e.g., from database)."""
        if 'adapter_type' in data and isinstance(data['adapter_type'], str):
            data['adapter_type'] = AdapterType(data['adapter_type'])
        if 'auth_type' in data and isinstance(data['auth_type'], str):
            data['auth_type'] = AuthType(data['auth_type'])
        return cls(**data)


@dataclass
class L5Result:
    """Base result class for all L5 tools."""
    success: bool
    tool_id: str
    data: Any = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    cached: bool = False
    execution_time_ms: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ============================================================================
# BASE TOOL CLASS
# ============================================================================

class L5BaseTool(ABC, Generic[T]):
    """
    Abstract base class for all L5 tools.
    
    L5 tools are atomic, single-purpose operations with:
    - NO LLM cost (direct API/service access)
    - Structured input/output
    - Built-in caching, rate limiting, error handling
    - Langfuse observability
    
    Type Parameters:
        T: The result type for this tool (defaults to Dict[str, Any])
    """
    
    def __init__(self, config: ToolConfig):
        self.config = config
        self._client = None
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._request_count = 0
        self._last_request_time = 0.0
        
        logger.info(
            f"vital_l5_{config.slug}_initialized",
            tool_id=config.id,
            tier=config.tier,
        )
    
    @property
    def client(self):
        """Lazy-initialize HTTP client."""
        if self._client is None:
            import httpx
            
            headers = {}
            
            # Add authentication headers
            if self.config.auth_type == AuthType.API_KEY and self.config.auth_env_var:
                api_key = os.getenv(self.config.auth_env_var)
                if api_key:
                    headers["X-API-Key"] = api_key
            elif self.config.auth_type == AuthType.BEARER and self.config.auth_env_var:
                token = os.getenv(self.config.auth_env_var)
                if token:
                    headers["Authorization"] = f"Bearer {token}"
            
            self._client = httpx.AsyncClient(
                timeout=self.config.timeout,
                headers=headers
            )
        
        return self._client
    
    async def execute(self, params: Dict[str, Any]) -> L5Result:
        """
        Execute the tool with caching and error handling.
        
        Args:
            params: Tool-specific parameters
            
        Returns:
            L5Result with success/failure and data
        """
        import time
        start_time = time.time()
        
        logger.info(
            f"vital_l5_{self.config.slug}_execute_started",
            tool_id=self.config.id,
            params_keys=list(params.keys()),
        )
        
        # Check cache
        if self.config.cache_ttl > 0:
            cache_key = self._get_cache_key(params)
            cached_result = self._get_cached(cache_key)
            if cached_result:
                cached_result['cached'] = True
                return L5Result(**cached_result)
        
        # Rate limiting
        await self._apply_rate_limit()
        
        # Execute with retries
        try:
            result = await self._execute_with_retry(params)
            execution_time = (time.time() - start_time) * 1000
            
            # Create result
            l5_result = L5Result(
                success=True,
                tool_id=self.config.id,
                data=result,
                execution_time_ms=execution_time,
            )
            
            # Cache successful result
            if self.config.cache_ttl > 0:
                self._set_cached(cache_key, l5_result.to_dict())
            
            logger.info(
                f"vital_l5_{self.config.slug}_execute_completed",
                tool_id=self.config.id,
                execution_time_ms=execution_time,
            )
            
            return l5_result
            
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            
            logger.error(
                f"vital_l5_{self.config.slug}_execute_failed",
                tool_id=self.config.id,
                error=str(e),
            )
            
            return L5Result(
                success=False,
                tool_id=self.config.id,
                error=str(e),
                execution_time_ms=execution_time,
            )
    
    @abstractmethod
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        """Implement the actual tool execution logic."""
        pass
    
    async def _execute_with_retry(self, params: Dict[str, Any]) -> Any:
        """Execute with exponential backoff retry."""
        last_error = None
        
        for attempt in range(self.config.max_retries):
            try:
                return await self._execute_impl(params)
            except Exception as e:
                last_error = e
                if attempt < self.config.max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    logger.warning(
                        f"vital_l5_{self.config.slug}_retry",
                        attempt=attempt + 1,
                        wait_time=wait_time,
                    )
                    await asyncio.sleep(wait_time)
        
        raise last_error
    
    async def _apply_rate_limit(self):
        """Simple rate limiting."""
        import time
        current_time = time.time()
        min_interval = 1.0 / self.config.rate_limit
        
        if current_time - self._last_request_time < min_interval:
            await asyncio.sleep(min_interval)
        
        self._last_request_time = time.time()
    
    def _get_cache_key(self, params: Dict[str, Any]) -> str:
        """Generate cache key from parameters."""
        param_str = json.dumps(params, sort_keys=True)
        return f"{self.config.id}:{hashlib.md5(param_str.encode()).hexdigest()}"
    
    def _get_cached(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get from cache if valid."""
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if (datetime.utcnow() - cached['timestamp']).total_seconds() < self.config.cache_ttl:
                return cached['data']
            else:
                del self._cache[cache_key]
        return None
    
    def _set_cached(self, cache_key: str, data: Dict[str, Any]) -> None:
        """Set cache entry."""
        self._cache[cache_key] = {
            'data': data,
            'timestamp': datetime.utcnow(),
        }
    
    def get_cost(self) -> float:
        """Return cost per call."""
        return self.config.cost_per_call
    
    async def close(self):
        """Clean up resources."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    # ========================================================================
    # HELPER METHODS FOR SUBCLASSES
    # ========================================================================
    
    async def _get(
        self,
        url: str,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Make GET request."""
        response = await self.client.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    
    async def _post(
        self,
        url: str,
        data: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Make POST request."""
        response = await self.client.post(
            url,
            data=data,
            json=json_data,
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    
    async def _get_xml(
        self,
        url: str,
        params: Optional[Dict] = None,
    ) -> str:
        """Make GET request for XML response."""
        response = await self.client.get(url, params=params)
        response.raise_for_status()
        return response.text


# ============================================================================
# DECORATORS
# ============================================================================

def requires_auth(env_var: str):
    """Decorator to check for required authentication."""
    def decorator(func):
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            if not os.getenv(env_var):
                raise ValueError(f"Missing authentication: {env_var}")
            return await func(self, *args, **kwargs)
        return wrapper
    return decorator


def log_execution(func):
    """Decorator to log tool execution."""
    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        logger.info(f"vital_l5_{self.config.slug}_start")
        result = await func(self, *args, **kwargs)
        logger.info(f"vital_l5_{self.config.slug}_end")
        return result
    return wrapper


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    # Enums
    "ToolTier",
    "AdapterType",
    "AuthType",
    # Config & Result
    "ToolConfig",
    "L5Result",
    # Base class
    "L5BaseTool",
    # Decorators
    "requires_auth",
    "log_execution",
]
