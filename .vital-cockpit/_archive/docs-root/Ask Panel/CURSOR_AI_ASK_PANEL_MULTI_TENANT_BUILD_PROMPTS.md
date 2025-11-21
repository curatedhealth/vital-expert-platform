# 🎯 Cursor AI Build Prompts: Ask Panel Multi-Tenant Architecture

**Version**: 1.0  
**Created**: November 1, 2025  
**Architecture**: Domain-Driven Design + Multi-Tenant First  
**Focus**: Tenant-Driven Services with Shared Backend + Dedicated Frontend

---

## 📋 TABLE OF CONTENTS

1. [Multi-Tenant Architecture Overview](#multi-tenant-architecture-overview)
2. [Phase 1: Multi-Tenant Foundation](#phase-1-multi-tenant-foundation)
3. [Phase 2: Tenant-Aware Domain Layer](#phase-2-tenant-aware-domain-layer)
4. [Phase 3: Shared Backend Services](#phase-3-shared-backend-services)
5. [Phase 4: Tenant Frontend Isolation](#phase-4-tenant-frontend-isolation)
6. [Phase 5: Tenant Configuration & Customization](#phase-5-tenant-configuration--customization)
7. [Phase 6: Testing Multi-Tenancy](#phase-6-testing-multi-tenancy)

---

## 🏗️ MULTI-TENANT ARCHITECTURE OVERVIEW

### Architecture Principles

**VITAL's Multi-Tenant Model:**
```
┌─────────────────────────────────────────────────────────────┐
│                    TENANT ISOLATION LAYERS                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Tenant A    │  │  Tenant B    │  │  Tenant C    │     │
│  │  Frontend    │  │  Frontend    │  │  Frontend    │     │
│  │  (Dedicated) │  │  (Dedicated) │  │  (Dedicated) │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐             │
│         │   API Gateway with Tenant Context   │             │
│         │   (X-Tenant-ID header injection)    │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐     │
│  │         SHARED BACKEND SERVICES                    │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │  Ask Panel Service (Shared)              │     │     │
│  │  │  - Multi-tenant orchestration            │     │     │
│  │  │  - Tenant context in all operations      │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │  Shared Kernel (Shared)                  │     │     │
│  │  │  - 136+ Agents (shared)                  │     │     │
│  │  │  - Prompts (shared)                      │     │     │
│  │  │  - RAG Engine (shared)                   │     │     │
│  │  │  - Infrastructure (shared)               │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         DATABASE WITH RLS (Row Level Security)   │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │      │
│  │  │ Tenant A   │  │ Tenant B   │  │ Tenant C   │ │      │
│  │  │ Data       │  │ Data       │  │ Data       │ │      │
│  │  │ (Isolated) │  │ (Isolated) │  │ (Isolated) │ │      │
│  │  └────────────┘  └────────────┘  └────────────┘ │      │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. Dedicated Frontend per Tenant**
- Each tenant has their own Next.js app deployment
- Custom branding, themes, and configurations
- Tenant-specific routing and navigation
- Isolated user sessions

**2. Shared Backend Services**
- Single Ask Panel service instance serves all tenants
- Tenant context injected via X-Tenant-ID header
- Multi-tenant aware at every layer (domain, application, infrastructure)
- Shared compute resources with tenant isolation

**3. Shared Resources with Tenant Context**
- 136+ AI agents shared across all tenants
- Prompts and RAG engine shared but tenant-scoped
- Database with Row-Level Security (RLS)
- Redis cache with tenant-prefixed keys

**4. Tenant Configuration**
- Per-tenant settings (branding, features, limits)
- Per-tenant usage tracking and billing
- Per-tenant customization (expert selection preferences, panel defaults)

---

## 🔷 PHASE 1: MULTI-TENANT FOUNDATION

### PROMPT 1.1: Create Multi-Tenant Shared Kernel with Tenant Context

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building VITAL platform with multi-tenant architecture. Multiple tenants will share the same backend services but have dedicated frontends. I need to create a shared kernel that is tenant-aware at every layer.

CRITICAL REQUIREMENT: 
Every operation MUST have tenant context. No operation should execute without knowing which tenant it belongs to.

TASK:
Create the shared kernel foundation with built-in tenant awareness.

DIRECTORY STRUCTURE:
services/shared-kernel/
├── src/
│   └── vital_shared_kernel/
│       ├── __init__.py
│       ├── multi_tenant/                    # 🆕 TENANT INFRASTRUCTURE
│       │   ├── __init__.py
│       │   ├── tenant_context.py            # Tenant context management
│       │   ├── tenant_registry.py           # Tenant configuration
│       │   ├── tenant_validator.py          # Tenant validation
│       │   └── tenant_middleware.py         # FastAPI middleware
│       ├── agents/
│       │   ├── __init__.py
│       │   ├── registry/
│       │   │   ├── __init__.py
│       │   │   ├── agent_registry.py        # Shared, tenant-aware
│       │   │   ├── agent_loader.py
│       │   │   └── tenant_agent_config.py   # 🆕 Per-tenant agent config
│       │   ├── definitions/
│       │   │   ├── __init__.py
│       │   │   └── base_agent.py            # Tenant context in all calls
│       │   └── metadata/
│       │       └── agent_metadata.py
│       ├── rag/
│       │   ├── __init__.py
│       │   ├── engine/
│       │   │   ├── __init__.py
│       │   │   └── rag_engine.py            # Tenant-scoped document access
│       │   └── vectorstore/
│       │       └── supabase_vectorstore.py  # RLS enforced
│       ├── infrastructure/
│       │   ├── __init__.py
│       │   ├── database/
│       │   │   ├── __init__.py
│       │   │   ├── supabase_client.py       # Tenant RLS injection
│       │   │   ├── redis_client.py          # Tenant-prefixed keys
│       │   │   └── tenant_connection_pool.py # Per-tenant connections
│       │   ├── config/
│       │   │   ├── __init__.py
│       │   │   ├── settings.py
│       │   │   └── tenant_settings.py       # 🆕 Per-tenant config
│       │   ├── security/
│       │   │   ├── __init__.py
│       │   │   ├── auth_validator.py
│       │   │   └── tenant_auth.py           # 🆕 Tenant auth validation
│       │   └── monitoring/
│       │       ├── __init__.py
│       │       ├── logging.py               # Tenant ID in all logs
│       │       └── tenant_metrics.py        # 🆕 Per-tenant metrics
│       └── domain/
│           ├── __init__.py
│           ├── value_objects/
│           │   ├── __init__.py
│           │   ├── tenant_id.py             # 🆕 Strong tenant ID type
│           │   ├── agent_id.py
│           │   └── confidence_score.py
│           └── exceptions/
│               ├── __init__.py
│               ├── domain_exceptions.py
│               └── tenant_exceptions.py      # 🆕 Tenant-specific errors

TENANT CONTEXT REQUIREMENTS:

1. FILE: services/shared-kernel/src/vital_shared_kernel/domain/value_objects/tenant_id.py

Create a strong type for tenant IDs:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
import re

class TenantId(BaseModel):
    """Strong type for tenant identifier with validation"""
    
    value: str = Field(..., min_length=1, max_length=50)
    
    @validator('value')
    def validate_tenant_id(cls, v):
        """Validate tenant ID format"""
        if not re.match(r'^[a-zA-Z0-9\-_]+$', v):
            raise ValueError("Tenant ID must be alphanumeric with hyphens/underscores")
        return v
    
    def __str__(self) -> str:
        return self.value
    
    def __hash__(self) -> int:
        return hash(self.value)
    
    def __eq__(self, other) -> bool:
        if isinstance(other, TenantId):
            return self.value == other.value
        return False
    
    class Config:
        frozen = True  # Immutable
```

2. FILE: services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_context.py

Create tenant context manager using context variables (thread-safe):

```python
from contextvars import ContextVar
from typing import Optional
from ..domain.value_objects.tenant_id import TenantId

# Thread-safe context variable for current tenant
_tenant_context: ContextVar[Optional[TenantId]] = ContextVar('tenant_context', default=None)

class TenantContext:
    """Manages current tenant context for request scope"""
    
    @staticmethod
    def set(tenant_id: TenantId) -> None:
        """Set current tenant context"""
        _tenant_context.set(tenant_id)
    
    @staticmethod
    def get() -> TenantId:
        """Get current tenant context"""
        tenant_id = _tenant_context.get()
        if tenant_id is None:
            raise TenantContextNotSetError(
                "Tenant context not set. All operations must have tenant context."
            )
        return tenant_id
    
    @staticmethod
    def get_optional() -> Optional[TenantId]:
        """Get current tenant context (returns None if not set)"""
        return _tenant_context.get()
    
    @staticmethod
    def clear() -> None:
        """Clear tenant context"""
        _tenant_context.set(None)
    
    @staticmethod
    def is_set() -> bool:
        """Check if tenant context is set"""
        return _tenant_context.get() is not None

class TenantContextNotSetError(Exception):
    """Raised when operation attempted without tenant context"""
    pass
```

3. FILE: services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_registry.py

Create tenant registry for tenant configuration:

```python
from typing import Dict, Optional, List
from pydantic import BaseModel
from ..domain.value_objects.tenant_id import TenantId
from ..infrastructure.database.supabase_client import get_supabase_client

class TenantConfig(BaseModel):
    """Tenant configuration"""
    tenant_id: TenantId
    name: str
    status: str  # active, suspended, inactive
    tier: str    # starter, professional, enterprise
    features: Dict[str, bool]  # Feature flags
    limits: Dict[str, int]     # Usage limits
    branding: Dict[str, str]   # Logo, colors, etc.
    metadata: Dict[str, any]
    created_at: str
    updated_at: str

class TenantRegistry:
    """Central registry for tenant configurations"""
    
    _instance = None
    _cache: Dict[str, TenantConfig] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def get_tenant(self, tenant_id: TenantId) -> Optional[TenantConfig]:
        """Get tenant configuration"""
        # Check cache
        cached = self._cache.get(str(tenant_id))
        if cached:
            return cached
        
        # Fetch from database
        supabase = get_supabase_client()
        result = await supabase.table("tenants")\
            .select("*")\
            .eq("id", str(tenant_id))\
            .single()\
            .execute()
        
        if not result.data:
            return None
        
        config = TenantConfig(**result.data)
        self._cache[str(tenant_id)] = config
        return config
    
    async def validate_tenant(self, tenant_id: TenantId) -> bool:
        """Validate tenant exists and is active"""
        config = await self.get_tenant(tenant_id)
        return config is not None and config.status == "active"
    
    async def get_tenant_features(self, tenant_id: TenantId) -> Dict[str, bool]:
        """Get tenant feature flags"""
        config = await self.get_tenant(tenant_id)
        return config.features if config else {}
    
    async def get_tenant_limits(self, tenant_id: TenantId) -> Dict[str, int]:
        """Get tenant usage limits"""
        config = await self.get_tenant(tenant_id)
        return config.limits if config else {}
    
    def clear_cache(self, tenant_id: Optional[TenantId] = None):
        """Clear tenant cache"""
        if tenant_id:
            self._cache.pop(str(tenant_id), None)
        else:
            self._cache.clear()
```

4. FILE: services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_middleware.py

Create FastAPI middleware for tenant context injection:

```python
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from .tenant_context import TenantContext
from .tenant_registry import TenantRegistry
from ..domain.value_objects.tenant_id import TenantId
import logging

logger = logging.getLogger(__name__)

class TenantMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware to inject tenant context"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip health check endpoints
        if request.url.path in ["/health", "/metrics", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Extract tenant ID from header
        tenant_id_str = request.headers.get("X-Tenant-ID")
        
        if not tenant_id_str:
            logger.error("Missing X-Tenant-ID header", extra={
                "path": request.url.path,
                "method": request.method
            })
            raise HTTPException(
                status_code=400,
                detail="X-Tenant-ID header is required"
            )
        
        try:
            # Create tenant ID value object
            tenant_id = TenantId(value=tenant_id_str)
            
            # Validate tenant
            registry = TenantRegistry()
            is_valid = await registry.validate_tenant(tenant_id)
            
            if not is_valid:
                logger.error("Invalid or inactive tenant", extra={
                    "tenant_id": str(tenant_id)
                })
                raise HTTPException(
                    status_code=403,
                    detail="Invalid or inactive tenant"
                )
            
            # Set tenant context for this request
            TenantContext.set(tenant_id)
            
            # Log request with tenant context
            logger.info("Request processing", extra={
                "tenant_id": str(tenant_id),
                "path": request.url.path,
                "method": request.method
            })
            
            # Process request
            response = await call_next(request)
            
            # Add tenant ID to response headers
            response.headers["X-Tenant-ID"] = str(tenant_id)
            
            return response
            
        except ValueError as e:
            logger.error("Invalid tenant ID format", extra={
                "tenant_id_str": tenant_id_str,
                "error": str(e)
            })
            raise HTTPException(
                status_code=400,
                detail=f"Invalid tenant ID format: {str(e)}"
            )
        finally:
            # Always clear context after request
            TenantContext.clear()
```

REQUIREMENTS:
1. Create ALL files listed above
2. Use contextvars for thread-safe tenant context
3. Strong typing with TenantId value object
4. Middleware automatically injects tenant context
5. All logs include tenant_id
6. Cache tenant configurations
7. Validate tenant on every request

INTEGRATION EXAMPLE:
```python
# In FastAPI app
from vital_shared_kernel.multi_tenant import TenantMiddleware

app = FastAPI()
app.add_middleware(TenantMiddleware)

# In any service/repository
from vital_shared_kernel.multi_tenant import TenantContext

async def some_operation():
    tenant_id = TenantContext.get()  # Always available in request scope
    # Use tenant_id for all operations
```

Create the complete multi-tenant foundation with all files.
```

**Expected Output**: Complete multi-tenant infrastructure with context management

---

### PROMPT 1.2: Create Tenant-Aware Database Layer

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building VITAL's multi-tenant platform. All database operations must be tenant-aware with Row-Level Security (RLS) enforced at the database level AND application level.

TASK:
Create tenant-aware database clients with automatic tenant context injection.

FILES TO CREATE:

1. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/database/supabase_client.py

REQUIREMENTS:
- Singleton Supabase client
- Automatic tenant_id injection in all queries
- Row-Level Security (RLS) enforcement
- Query logging with tenant context
- Connection pooling

```python
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
from ...multi_tenant.tenant_context import TenantContext
from ...domain.value_objects.tenant_id import TenantId
from ..config.settings import settings
import logging

logger = logging.getLogger(__name__)

class TenantAwareSupabaseClient:
    """Supabase client with automatic tenant context injection"""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get singleton Supabase client"""
        if cls._instance is None:
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        return cls._instance
    
    @staticmethod
    def _inject_tenant_filter(query: Any, tenant_id: TenantId) -> Any:
        """Inject tenant filter into query"""
        return query.eq("tenant_id", str(tenant_id))
    
    @staticmethod
    async def execute_query(
        table: str,
        operation: str,  # select, insert, update, delete
        filters: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[TenantId] = None
    ) -> Dict[str, Any]:
        """Execute database query with tenant context"""
        
        # Get tenant context
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        client = TenantAwareSupabaseClient.get_client()
        
        try:
            # Build query
            query = client.table(table)
            
            # Apply operation
            if operation == "select":
                query = query.select("*")
            elif operation == "insert":
                if data:
                    # Inject tenant_id into data
                    data["tenant_id"] = str(tenant_id)
                query = query.insert(data)
            elif operation == "update":
                if data:
                    query = query.update(data)
            elif operation == "delete":
                query = query.delete()
            else:
                raise ValueError(f"Invalid operation: {operation}")
            
            # CRITICAL: Apply tenant filter for ALL operations
            query = TenantAwareSupabaseClient._inject_tenant_filter(query, tenant_id)
            
            # Apply additional filters
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            # Execute
            result = await query.execute()
            
            # Log query
            logger.info(f"Database {operation}", extra={
                "tenant_id": str(tenant_id),
                "table": table,
                "filters": filters,
                "rows_affected": len(result.data) if result.data else 0
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Database {operation} failed", extra={
                "tenant_id": str(tenant_id),
                "table": table,
                "error": str(e)
            })
            raise
    
    @staticmethod
    async def select(
        table: str,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[TenantId] = None
    ) -> List[Dict[str, Any]]:
        """SELECT with tenant context"""
        result = await TenantAwareSupabaseClient.execute_query(
            table=table,
            operation="select",
            filters=filters,
            tenant_id=tenant_id
        )
        return result.data if result.data else []
    
    @staticmethod
    async def insert(
        table: str,
        data: Dict[str, Any],
        tenant_id: Optional[TenantId] = None
    ) -> Dict[str, Any]:
        """INSERT with tenant context"""
        result = await TenantAwareSupabaseClient.execute_query(
            table=table,
            operation="insert",
            data=data,
            tenant_id=tenant_id
        )
        return result.data[0] if result.data else {}
    
    @staticmethod
    async def update(
        table: str,
        data: Dict[str, Any],
        filters: Dict[str, Any],
        tenant_id: Optional[TenantId] = None
    ) -> Dict[str, Any]:
        """UPDATE with tenant context"""
        result = await TenantAwareSupabaseClient.execute_query(
            table=table,
            operation="update",
            data=data,
            filters=filters,
            tenant_id=tenant_id
        )
        return result.data[0] if result.data else {}
    
    @staticmethod
    async def delete(
        table: str,
        filters: Dict[str, Any],
        tenant_id: Optional[TenantId] = None
    ) -> bool:
        """DELETE with tenant context"""
        result = await TenantAwareSupabaseClient.execute_query(
            table=table,
            operation="delete",
            filters=filters,
            tenant_id=tenant_id
        )
        return True
```

2. FILE: services/shared-kernel/src/vital_shared_kernel/infrastructure/database/redis_client.py

REQUIREMENTS:
- Tenant-prefixed cache keys
- Automatic tenant context injection
- TTL management
- Cache invalidation per tenant

```python
import redis.asyncio as redis
from typing import Optional, Any
import json
from ...multi_tenant.tenant_context import TenantContext
from ...domain.value_objects.tenant_id import TenantId
from ..config.settings import settings
import logging

logger = logging.getLogger(__name__)

class TenantAwareRedisClient:
    """Redis client with tenant-prefixed keys"""
    
    _instance: Optional[redis.Redis] = None
    
    @classmethod
    async def get_client(cls) -> redis.Redis:
        """Get singleton Redis client"""
        if cls._instance is None:
            cls._instance = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        return cls._instance
    
    @staticmethod
    def _build_key(key: str, tenant_id: TenantId) -> str:
        """Build tenant-prefixed cache key"""
        return f"tenant:{str(tenant_id)}:{key}"
    
    @staticmethod
    async def get(
        key: str,
        tenant_id: Optional[TenantId] = None
    ) -> Optional[Any]:
        """Get value from cache with tenant context"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        client = await TenantAwareRedisClient.get_client()
        prefixed_key = TenantAwareRedisClient._build_key(key, tenant_id)
        
        try:
            value = await client.get(prefixed_key)
            if value:
                logger.debug("Cache hit", extra={
                    "tenant_id": str(tenant_id),
                    "key": key
                })
                return json.loads(value)
            return None
        except Exception as e:
            logger.error("Cache get failed", extra={
                "tenant_id": str(tenant_id),
                "key": key,
                "error": str(e)
            })
            return None
    
    @staticmethod
    async def set(
        key: str,
        value: Any,
        ttl: int = 300,  # 5 minutes default
        tenant_id: Optional[TenantId] = None
    ) -> bool:
        """Set value in cache with tenant context"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        client = await TenantAwareRedisClient.get_client()
        prefixed_key = TenantAwareRedisClient._build_key(key, tenant_id)
        
        try:
            await client.setex(
                prefixed_key,
                ttl,
                json.dumps(value)
            )
            logger.debug("Cache set", extra={
                "tenant_id": str(tenant_id),
                "key": key,
                "ttl": ttl
            })
            return True
        except Exception as e:
            logger.error("Cache set failed", extra={
                "tenant_id": str(tenant_id),
                "key": key,
                "error": str(e)
            })
            return False
    
    @staticmethod
    async def delete(
        key: str,
        tenant_id: Optional[TenantId] = None
    ) -> bool:
        """Delete value from cache"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        client = await TenantAwareRedisClient.get_client()
        prefixed_key = TenantAwareRedisClient._build_key(key, tenant_id)
        
        try:
            await client.delete(prefixed_key)
            return True
        except Exception as e:
            logger.error("Cache delete failed", extra={
                "tenant_id": str(tenant_id),
                "key": key,
                "error": str(e)
            })
            return False
    
    @staticmethod
    async def clear_tenant_cache(tenant_id: TenantId) -> int:
        """Clear all cache entries for a tenant"""
        client = await TenantAwareRedisClient.get_client()
        pattern = f"tenant:{str(tenant_id)}:*"
        
        try:
            keys = await client.keys(pattern)
            if keys:
                deleted = await client.delete(*keys)
                logger.info("Tenant cache cleared", extra={
                    "tenant_id": str(tenant_id),
                    "keys_deleted": deleted
                })
                return deleted
            return 0
        except Exception as e:
            logger.error("Tenant cache clear failed", extra={
                "tenant_id": str(tenant_id),
                "error": str(e)
            })
            return 0
```

CRITICAL DATABASE SCHEMA:

ALL tables must have:
- `tenant_id` column (UUID, NOT NULL, INDEXED)
- Row-Level Security (RLS) enabled
- RLS policies that filter by tenant_id

Example SQL for panels table:
```sql
-- Create panels table with tenant_id
CREATE TABLE panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    query TEXT NOT NULL,
    panel_type TEXT NOT NULL,
    status TEXT NOT NULL,
    members JSONB,
    discussions JSONB,
    consensus JSONB,
    final_recommendation TEXT,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_panels_tenant_id ON panels(tenant_id);
CREATE INDEX idx_panels_tenant_user ON panels(tenant_id, user_id);
CREATE INDEX idx_panels_tenant_status ON panels(tenant_id, status);

-- Enable Row-Level Security
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY tenant_isolation_policy ON panels
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Grant access
GRANT ALL ON panels TO authenticated;
```

USAGE EXAMPLE:
```python
from vital_shared_kernel.infrastructure.database import TenantAwareSupabaseClient

# Get will automatically filter by current tenant
panels = await TenantAwareSupabaseClient.select(
    table="panels",
    filters={"status": "completed"}
)
# Returns only panels for current tenant

# Insert will automatically inject tenant_id
panel = await TenantAwareSupabaseClient.insert(
    table="panels",
    data={"query": "...", "status": "created"}
)
# tenant_id automatically added to data
```

Create both files with complete tenant-aware database operations.
```

**Expected Output**: Tenant-aware Supabase and Redis clients

---

### PROMPT 1.3: Create Tenant-Aware Agent Registry

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building VITAL's multi-tenant platform. The 136+ AI agents are SHARED across all tenants, but agent selection and configuration can be tenant-specific.

ARCHITECTURE:
- Agents themselves are shared (single instances)
- Agent selection preferences are per-tenant
- Agent usage tracking is per-tenant
- Agent responses include tenant context

FILE: services/shared-kernel/src/vital_shared_kernel/agents/registry/agent_registry.py

TASK:
Create a tenant-aware agent registry that shares agents but tracks tenant-specific usage and preferences.

```python
from typing import List, Optional, Dict
from ..definitions.base_agent import BaseAgent
from ...multi_tenant.tenant_context import TenantContext
from ...domain.value_objects.tenant_id import TenantId
from ...infrastructure.database import TenantAwareRedisClient
import logging

logger = logging.getLogger(__name__)

class TenantAwareAgentRegistry:
    """
    Central registry for all AI agents with tenant-aware features.
    
    ARCHITECTURE:
    - Agents are SHARED across tenants (single instances)
    - Agent preferences are PER-TENANT
    - Usage tracking is PER-TENANT
    - Cache is TENANT-SCOPED
    """
    
    _instance = None
    _agents: Dict[str, BaseAgent] = {}  # Shared agent instances
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def register(self, agent: BaseAgent):
        """Register a shared agent (not tenant-specific)"""
        self._agents[agent.id] = agent
        logger.info(f"Agent registered: {agent.id}")
    
    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Get shared agent instance"""
        return self._agents.get(agent_id)
    
    async def get_tenant_preferred_agents(
        self,
        domain: str,
        tenant_id: Optional[TenantId] = None
    ) -> List[BaseAgent]:
        """
        Get tenant's preferred agents for a domain.
        Falls back to default if no preferences set.
        """
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        # Try cache first
        cache_key = f"preferred_agents:{domain}"
        cached = await TenantAwareRedisClient.get(cache_key, tenant_id)
        if cached:
            return [self._agents[aid] for aid in cached if aid in self._agents]
        
        # Load from database
        from ...infrastructure.database import TenantAwareSupabaseClient
        prefs = await TenantAwareSupabaseClient.select(
            table="tenant_agent_preferences",
            filters={"domain": domain},
            tenant_id=tenant_id
        )
        
        if prefs:
            agent_ids = prefs[0].get("preferred_agent_ids", [])
            agents = [self._agents[aid] for aid in agent_ids if aid in self._agents]
            
            # Cache for 1 hour
            await TenantAwareRedisClient.set(
                cache_key,
                agent_ids,
                ttl=3600,
                tenant_id=tenant_id
            )
            
            return agents
        
        # Return default agents for domain
        return [a for a in self._agents.values() if a.domain == domain]
    
    async def search_agents(
        self,
        query: str,
        domains: Optional[List[str]] = None,
        max_results: int = 10,
        tenant_id: Optional[TenantId] = None
    ) -> List[BaseAgent]:
        """
        Search for agents matching criteria.
        Considers tenant preferences in ranking.
        """
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        # Get all matching agents
        candidates = []
        for agent in self._agents.values():
            if domains and agent.domain not in domains:
                continue
            
            # Calculate relevance score
            score = await self._calculate_relevance(agent, query, tenant_id)
            candidates.append((agent, score))
        
        # Sort by score
        candidates.sort(key=lambda x: x[1], reverse=True)
        
        # Return top results
        return [agent for agent, _ in candidates[:max_results]]
    
    async def _calculate_relevance(
        self,
        agent: BaseAgent,
        query: str,
        tenant_id: TenantId
    ) -> float:
        """Calculate agent relevance with tenant preference boost"""
        # Base relevance from agent capabilities
        base_score = agent.calculate_relevance(query)
        
        # Check if agent is in tenant preferences
        is_preferred = await self._is_tenant_preferred(agent.id, tenant_id)
        
        # Boost score for preferred agents
        if is_preferred:
            base_score *= 1.2
        
        # Consider tenant usage history
        usage_boost = await self._get_usage_boost(agent.id, tenant_id)
        base_score += usage_boost
        
        return base_score
    
    async def _is_tenant_preferred(
        self,
        agent_id: str,
        tenant_id: TenantId
    ) -> bool:
        """Check if agent is in tenant's preferred list"""
        from ...infrastructure.database import TenantAwareSupabaseClient
        prefs = await TenantAwareSupabaseClient.select(
            table="tenant_agent_preferences",
            filters={"agent_id": agent_id},
            tenant_id=tenant_id
        )
        return len(prefs) > 0
    
    async def _get_usage_boost(
        self,
        agent_id: str,
        tenant_id: TenantId
    ) -> float:
        """Get usage-based boost for agent ranking"""
        from ...infrastructure.database import TenantAwareSupabaseClient
        usage = await TenantAwareSupabaseClient.select(
            table="agent_usage_stats",
            filters={"agent_id": agent_id},
            tenant_id=tenant_id
        )
        
        if usage and len(usage) > 0:
            # Higher usage = small boost
            use_count = usage[0].get("use_count", 0)
            avg_rating = usage[0].get("avg_rating", 0.0)
            return (use_count / 100.0) * avg_rating
        
        return 0.0
    
    async def track_agent_usage(
        self,
        agent_id: str,
        query: str,
        response_quality: float,
        tenant_id: Optional[TenantId] = None
    ):
        """Track agent usage for tenant-specific analytics"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        from ...infrastructure.database import TenantAwareSupabaseClient
        
        try:
            # Insert usage record
            await TenantAwareSupabaseClient.insert(
                table="agent_usage_logs",
                data={
                    "agent_id": agent_id,
                    "query": query,
                    "quality_score": response_quality,
                    "timestamp": "now()"
                },
                tenant_id=tenant_id
            )
            
            logger.info("Agent usage tracked", extra={
                "tenant_id": str(tenant_id),
                "agent_id": agent_id,
                "quality": response_quality
            })
        except Exception as e:
            logger.error("Failed to track agent usage", extra={
                "tenant_id": str(tenant_id),
                "agent_id": agent_id,
                "error": str(e)
            })
    
    async def set_tenant_agent_preferences(
        self,
        domain: str,
        preferred_agent_ids: List[str],
        tenant_id: Optional[TenantId] = None
    ):
        """Set tenant's preferred agents for a domain"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        from ...infrastructure.database import TenantAwareSupabaseClient
        
        # Upsert preferences
        await TenantAwareSupabaseClient.execute_query(
            table="tenant_agent_preferences",
            operation="insert",
            data={
                "domain": domain,
                "preferred_agent_ids": preferred_agent_ids
            },
            tenant_id=tenant_id
        )
        
        # Clear cache
        cache_key = f"preferred_agents:{domain}"
        await TenantAwareRedisClient.delete(cache_key, tenant_id)
        
        logger.info("Tenant agent preferences updated", extra={
            "tenant_id": str(tenant_id),
            "domain": domain,
            "num_agents": len(preferred_agent_ids)
        })
```

TENANT-SPECIFIC DATABASE TABLES:

```sql
-- Tenant agent preferences
CREATE TABLE tenant_agent_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    domain TEXT NOT NULL,
    preferred_agent_ids TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, domain)
);

CREATE INDEX idx_tenant_agent_prefs_tenant ON tenant_agent_preferences(tenant_id);
ALTER TABLE tenant_agent_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON tenant_agent_preferences
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Agent usage logs (per tenant)
CREATE TABLE agent_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    query TEXT NOT NULL,
    quality_score FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_usage_tenant_agent ON agent_usage_logs(tenant_id, agent_id);
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON agent_usage_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Agent usage statistics (aggregated per tenant)
CREATE TABLE agent_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    use_count INTEGER DEFAULT 0,
    avg_rating FLOAT DEFAULT 0.0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, agent_id)
);

CREATE INDEX idx_agent_stats_tenant ON agent_usage_stats(tenant_id);
ALTER TABLE agent_usage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON agent_usage_stats
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

KEY POINTS:
1. Agents are SHARED (same instances for all tenants)
2. Preferences are PER-TENANT
3. Usage tracking is PER-TENANT
4. Cache keys are TENANT-PREFIXED
5. All database queries filtered by tenant_id

Create the complete tenant-aware agent registry.
```

**Expected Output**: Tenant-aware agent registry with shared agents

---

### ✅ PHASE 1 VALIDATION CHECKLIST

```bash
# 1. Test tenant context
python -c "
from vital_shared_kernel.multi_tenant import TenantContext, TenantId
from vital_shared_kernel.domain.value_objects import TenantId

tenant = TenantId(value='test-tenant')
TenantContext.set(tenant)
assert TenantContext.get() == tenant
print('✅ Tenant context OK')
"

# 2. Test database client
python -c "
from vital_shared_kernel.infrastructure.database import TenantAwareSupabaseClient
print('✅ Database client OK')
"

# 3. Test Redis client
python -c "
from vital_shared_kernel.infrastructure.database import TenantAwareRedisClient
print('✅ Redis client OK')
"

# 4. Test agent registry
python -c "
from vital_shared_kernel.agents.registry import TenantAwareAgentRegistry
registry = TenantAwareAgentRegistry()
print('✅ Agent registry OK')
"
```

**Success Criteria:**
- [ ] TenantId value object created
- [ ] TenantContext manager working
- [ ] Tenant middleware functional
- [ ] Database client with RLS
- [ ] Redis with tenant prefixes
- [ ] Agent registry tenant-aware
- [ ] All imports working
- [ ] Tests passing

---

## 🎭 PHASE 2: TENANT-AWARE DOMAIN LAYER

### Overview

Build the Ask Panel service domain layer with tenant context embedded in all domain models and operations.

---

### PROMPT 2.1: Create Tenant-Aware Panel Aggregate

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service with multi-tenant architecture. The Panel aggregate root must include tenant context and enforce tenant isolation at the domain level.

FILE: services/ask-panel-service/src/domain/models/panel.py

TASK:
Create the Panel aggregate root with built-in tenant awareness.

REQUIREMENTS:

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum
import uuid

# Import from shared kernel
from vital_shared_kernel.domain.value_objects import TenantId
from vital_shared_kernel.multi_tenant import TenantContext

from .panel_type import PanelType
from .panel_status import PanelStatus
from .panel_member import PanelMember
from .discussion import Discussion
from .consensus import Consensus

class Panel(BaseModel):
    """
    Panel Aggregate Root - Multi-Tenant
    
    TENANT ISOLATION:
    - tenant_id is immutable and always required
    - All operations validate tenant context matches panel's tenant
    - Cross-tenant access is prevented at domain level
    """
    
    # Identity (including tenant)
    panel_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: TenantId  # CRITICAL: Every panel belongs to exactly one tenant
    user_id: str
    
    # Panel configuration
    query: str = Field(..., min_length=10, max_length=5000)
    panel_type: PanelType
    status: PanelStatus = PanelStatus.CREATED
    
    # Panel composition
    members: List[PanelMember] = Field(default_factory=list)
    discussions: List[Discussion] = Field(default_factory=list)
    
    # Results
    consensus: Optional[Consensus] = None
    final_recommendation: Optional[str] = None
    
    # Metadata
    metadata: Dict = Field(default_factory=dict)
    version: int = 1  # For optimistic locking
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    
    class Config:
        frozen = False  # Mutable aggregate
    
    @validator('tenant_id', pre=True, always=True)
    def validate_tenant_id(cls, v, values):
        """Ensure tenant_id is always a TenantId value object"""
        if isinstance(v, str):
            return TenantId(value=v)
        if isinstance(v, TenantId):
            return v
        if isinstance(v, dict):
            return TenantId(**v)
        raise ValueError("tenant_id must be a TenantId value object")
    
    def validate_tenant_context(self):
        """
        Validate that current tenant context matches panel's tenant.
        CRITICAL SECURITY: Prevents cross-tenant access.
        """
        current_tenant = TenantContext.get()
        if current_tenant != self.tenant_id:
            raise TenantMismatchError(
                f"Panel belongs to tenant {self.tenant_id} but current context is {current_tenant}"
            )
    
    def add_member(self, member: PanelMember) -> None:
        """Add expert member to panel"""
        self.validate_tenant_context()
        
        # Business rule: Cannot add members after discussion starts
        if self.status not in [PanelStatus.CREATED, PanelStatus.ASSIGNING_EXPERTS]:
            raise InvalidOperationError(
                "Cannot add members after discussion has started"
            )
        
        # Business rule: Check member limits for panel type
        min_members, max_members = self.panel_type.get_member_limits()
        if len(self.members) >= max_members:
            raise InvalidOperationError(
                f"{self.panel_type.value} panels can have maximum {max_members} members"
            )
        
        self.members.append(member)
        self.updated_at = datetime.now()
    
    def start_discussion(self) -> None:
        """Start panel discussion"""
        self.validate_tenant_context()
        
        # Business rule: Must have minimum members
        min_members, _ = self.panel_type.get_member_limits()
        if len(self.members) < min_members:
            raise InvalidOperationError(
                f"{self.panel_type.value} panels require minimum {min_members} members"
            )
        
        self.status = PanelStatus.IN_PROGRESS
        self.updated_at = datetime.now()
    
    def add_discussion_round(self, discussion: Discussion) -> None:
        """Add completed discussion round"""
        self.validate_tenant_context()
        
        if self.status != PanelStatus.IN_PROGRESS:
            raise InvalidOperationError(
                "Can only add discussions when panel is in progress"
            )
        
        self.discussions.append(discussion)
        self.updated_at = datetime.now()
    
    def update_consensus(self, consensus: Consensus) -> None:
        """Update panel consensus"""
        self.validate_tenant_context()
        
        self.consensus = consensus
        self.status = PanelStatus.BUILDING_CONSENSUS
        self.updated_at = datetime.now()
    
    def complete(self, recommendation: str) -> None:
        """Complete panel with final recommendation"""
        self.validate_tenant_context()
        
        if not self.consensus:
            raise InvalidOperationError(
                "Cannot complete panel without consensus"
            )
        
        self.final_recommendation = recommendation
        self.status = PanelStatus.COMPLETED
        self.completed_at = datetime.now()
        self.updated_at = datetime.now()
    
    def fail(self, error: str) -> None:
        """Mark panel as failed"""
        self.validate_tenant_context()
        
        self.status = PanelStatus.FAILED
        self.metadata["error"] = error
        self.updated_at = datetime.now()
    
    def calculate_estimated_duration(self) -> int:
        """Calculate estimated duration in seconds"""
        return self.panel_type.get_estimated_duration(len(self.members))
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary (tenant-safe)"""
        return {
            "panel_id": self.panel_id,
            "tenant_id": str(self.tenant_id),  # Always include tenant_id
            "user_id": self.user_id,
            "query": self.query,
            "panel_type": self.panel_type.value,
            "status": self.status.value,
            "members": [m.dict() for m in self.members],
            "discussions": [d.dict() for d in self.discussions],
            "consensus": self.consensus.dict() if self.consensus else None,
            "final_recommendation": self.final_recommendation,
            "metadata": self.metadata,
            "version": self.version,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "Panel":
        """Deserialize from dictionary (tenant-safe)"""
        # Ensure tenant_id is present
        if "tenant_id" not in data:
            raise ValueError("Panel data must include tenant_id")
        
        return cls(**data)

class TenantMismatchError(Exception):
    """Raised when operation attempted on panel from different tenant"""
    pass

class InvalidOperationError(Exception):
    """Raised when invalid operation attempted on panel"""
    pass
```

CRITICAL SECURITY FEATURES:
1. **tenant_id is immutable** - Cannot be changed after creation
2. **validate_tenant_context()** - Called in ALL mutating operations
3. **TenantMismatchError** - Prevents cross-tenant access
4. **Tenant context validation** - Domain-level security

USAGE EXAMPLE:
```python
from vital_shared_kernel.multi_tenant import TenantContext, TenantId

# Set tenant context (done by middleware)
tenant_id = TenantId(value="tenant-123")
TenantContext.set(tenant_id)

# Create panel (tenant_id automatically validated)
panel = Panel(
    tenant_id=tenant_id,
    user_id="user-456",
    query="What are FDA requirements?",
    panel_type=PanelType.STRUCTURED
)

# All operations validate tenant context
panel.add_member(member)  # ✅ Works - tenant matches
panel.start_discussion()  # ✅ Works - tenant matches

# Switch tenant context
TenantContext.set(TenantId(value="tenant-999"))
panel.add_member(member)  # ❌ Raises TenantMismatchError!
```

Create the complete tenant-aware Panel aggregate with security validation.
```

**Expected Output**: Panel aggregate with built-in tenant isolation

---

### PROMPT 2.2: Create Tenant-Aware Repository

**Copy this prompt to Cursor AI:**

```
PROJECT CONTEXT:
I'm building the Ask Panel service. The repository must enforce tenant isolation at both the application and database level.

FILE: services/ask-panel-service/src/infrastructure/persistence/panel_repo_impl.py

TASK:
Create a tenant-aware repository implementation with double-validation of tenant context.

```python
from typing import List, Optional
from datetime import datetime

from vital_shared_kernel.infrastructure.database import TenantAwareSupabaseClient
from vital_shared_kernel.multi_tenant import TenantContext
from vital_shared_kernel.domain.value_objects import TenantId

from ...domain.models.panel import Panel, TenantMismatchError
from ...domain.models.panel_status import PanelStatus
from ...domain.repositories.panel_repository import PanelRepository
import logging

logger = logging.getLogger(__name__)

class PanelRepositoryImpl(PanelRepository):
    """
    Tenant-aware Panel repository implementation.
    
    SECURITY LAYERS:
    1. Application level: Validates tenant_id parameter
    2. Domain level: Panel.validate_tenant_context()
    3. Database level: RLS filters by tenant_id
    4. Query level: Explicit tenant_id filters
    
    DEFENSE IN DEPTH: Multiple layers prevent cross-tenant access
    """
    
    async def create(self, panel: Panel) -> Panel:
        """Create new panel with tenant isolation"""
        # Layer 1: Validate panel's tenant matches current context
        panel.validate_tenant_context()
        
        # Layer 2: Prepare data with tenant_id
        data = {
            "id": panel.panel_id,
            "tenant_id": str(panel.tenant_id),  # Explicit tenant_id
            "user_id": panel.user_id,
            "query": panel.query,
            "panel_type": panel.panel_type.value,
            "status": panel.status.value,
            "members": [m.dict() for m in panel.members],
            "discussions": [d.dict() for d in panel.discussions],
            "consensus": panel.consensus.dict() if panel.consensus else None,
            "final_recommendation": panel.final_recommendation,
            "metadata": panel.metadata,
            "version": panel.version,
            "created_at": panel.created_at.isoformat(),
            "updated_at": panel.updated_at.isoformat()
        }
        
        # Layer 3: Database insert with automatic tenant injection
        try:
            await TenantAwareSupabaseClient.insert(
                table="panels",
                data=data,
                tenant_id=panel.tenant_id
            )
            
            logger.info("Panel created", extra={
                "tenant_id": str(panel.tenant_id),
                "panel_id": panel.panel_id,
                "panel_type": panel.panel_type.value
            })
            
            return panel
            
        except Exception as e:
            logger.error("Panel creation failed", extra={
                "tenant_id": str(panel.tenant_id),
                "panel_id": panel.panel_id,
                "error": str(e)
            })
            raise
    
    async def get_by_id(
        self,
        panel_id: str,
        tenant_id: Optional[TenantId] = None
    ) -> Optional[Panel]:
        """
        Get panel by ID with tenant validation.
        
        SECURITY: Double-checks tenant_id matches
        """
        # Use current context if not provided
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        try:
            # Query with explicit tenant filter
            results = await TenantAwareSupabaseClient.select(
                table="panels",
                filters={"id": panel_id},
                tenant_id=tenant_id
            )
            
            if not results:
                return None
            
            # Deserialize
            panel = Panel.from_dict(results[0])
            
            # Extra validation: Ensure tenant_id matches
            if panel.tenant_id != tenant_id:
                logger.error("Tenant mismatch detected", extra={
                    "requested_tenant": str(tenant_id),
                    "panel_tenant": str(panel.tenant_id),
                    "panel_id": panel_id
                })
                raise TenantMismatchError(
                    f"Panel belongs to different tenant"
                )
            
            return panel
            
        except TenantMismatchError:
            raise
        except Exception as e:
            logger.error("Panel fetch failed", extra={
                "tenant_id": str(tenant_id),
                "panel_id": panel_id,
                "error": str(e)
            })
            return None
    
    async def update(self, panel: Panel) -> Panel:
        """Update panel with optimistic locking and tenant validation"""
        # Validate tenant context
        panel.validate_tenant_context()
        
        # Prepare update data
        data = {
            "status": panel.status.value,
            "members": [m.dict() for m in panel.members],
            "discussions": [d.dict() for d in panel.discussions],
            "consensus": panel.consensus.dict() if panel.consensus else None,
            "final_recommendation": panel.final_recommendation,
            "metadata": panel.metadata,
            "version": panel.version + 1,  # Increment version
            "updated_at": datetime.now().isoformat(),
            "completed_at": panel.completed_at.isoformat() if panel.completed_at else None
        }
        
        try:
            # Update with optimistic locking check
            await TenantAwareSupabaseClient.update(
                table="panels",
                data=data,
                filters={
                    "id": panel.panel_id,
                    "version": panel.version  # Check version hasn't changed
                },
                tenant_id=panel.tenant_id
            )
            
            # Update panel version
            panel.version += 1
            panel.updated_at = datetime.now()
            
            logger.info("Panel updated", extra={
                "tenant_id": str(panel.tenant_id),
                "panel_id": panel.panel_id,
                "version": panel.version
            })
            
            return panel
            
        except Exception as e:
            logger.error("Panel update failed", extra={
                "tenant_id": str(panel.tenant_id),
                "panel_id": panel.panel_id,
                "error": str(e)
            })
            raise OptimisticLockError(
                f"Panel was modified by another process"
            )
    
    async def list_by_user(
        self,
        user_id: str,
        tenant_id: Optional[TenantId] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Panel]:
        """List panels for user within tenant"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        try:
            # Query with tenant and user filters
            results = await TenantAwareSupabaseClient.select(
                table="panels",
                filters={"user_id": user_id},
                tenant_id=tenant_id
            )
            
            # Apply pagination
            results = results[offset:offset + limit]
            
            # Deserialize panels
            panels = [Panel.from_dict(r) for r in results]
            
            # Extra validation
            for panel in panels:
                if panel.tenant_id != tenant_id:
                    logger.error("Tenant mismatch in list", extra={
                        "requested_tenant": str(tenant_id),
                        "panel_tenant": str(panel.tenant_id)
                    })
                    raise TenantMismatchError("Data corruption detected")
            
            return panels
            
        except TenantMismatchError:
            raise
        except Exception as e:
            logger.error("Panel list failed", extra={
                "tenant_id": str(tenant_id),
                "user_id": user_id,
                "error": str(e)
            })
            return []
    
    async def list_by_status(
        self,
        status: PanelStatus,
        tenant_id: Optional[TenantId] = None
    ) -> List[Panel]:
        """List panels by status within tenant"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        try:
            results = await TenantAwareSupabaseClient.select(
                table="panels",
                filters={"status": status.value},
                tenant_id=tenant_id
            )
            
            panels = [Panel.from_dict(r) for r in results]
            
            # Validate all belong to correct tenant
            for panel in panels:
                if panel.tenant_id != tenant_id:
                    raise TenantMismatchError("Data corruption detected")
            
            return panels
            
        except Exception as e:
            logger.error("Panel status list failed", extra={
                "tenant_id": str(tenant_id),
                "status": status.value,
                "error": str(e)
            })
            return []
    
    async def delete(
        self,
        panel_id: str,
        tenant_id: Optional[TenantId] = None
    ) -> bool:
        """Soft delete panel (set status to CANCELLED)"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        try:
            # Update status instead of hard delete
            await TenantAwareSupabaseClient.update(
                table="panels",
                data={
                    "status": PanelStatus.CANCELLED.value,
                    "updated_at": datetime.now().isoformat()
                },
                filters={"id": panel_id},
                tenant_id=tenant_id
            )
            
            logger.info("Panel deleted", extra={
                "tenant_id": str(tenant_id),
                "panel_id": panel_id
            })
            
            return True
            
        except Exception as e:
            logger.error("Panel deletion failed", extra={
                "tenant_id": str(tenant_id),
                "panel_id": panel_id,
                "error": str(e)
            })
            return False
    
    async def count_by_tenant(
        self,
        tenant_id: Optional[TenantId] = None
    ) -> int:
        """Count all panels for tenant"""
        if tenant_id is None:
            tenant_id = TenantContext.get()
        
        try:
            results = await TenantAwareSupabaseClient.select(
                table="panels",
                filters={},
                tenant_id=tenant_id
            )
            
            return len(results)
            
        except Exception as e:
            logger.error("Panel count failed", extra={
                "tenant_id": str(tenant_id),
                "error": str(e)
            })
            return 0

class OptimisticLockError(Exception):
    """Raised when optimistic locking fails"""
    pass
```

SECURITY FEATURES:
1. **4-layer validation** - App, domain, database, query
2. **Explicit tenant filters** - Never rely only on RLS
3. **Post-query validation** - Double-check tenant_id
4. **Optimistic locking** - Prevent concurrent modifications
5. **Comprehensive logging** - Audit all operations

Create the complete tenant-aware repository with defense-in-depth security.
```

**Expected Output**: Repository with multi-layer tenant isolation

---

I'll continue with the remaining phases. Would you like me to:

1. **Continue with Phase 3**: Shared Backend Services (panel orchestration, consensus, etc.)
2. **Continue with Phase 4**: Tenant Frontend Isolation (dedicated Next.js apps per tenant)
3. **Continue with Phase 5**: Tenant Configuration & Customization
4. **Continue with Phase 6**: Testing Multi-Tenancy

Or would you like me to package what we have so far into a complete markdown file and then continue?