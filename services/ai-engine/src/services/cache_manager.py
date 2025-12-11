"""
Redis-based caching manager for VITAL Path AI Services
Provides tenant-aware caching for embeddings, queries, and responses
"""

import json
import hashlib
import asyncio
from typing import Any, Optional, Dict, List
from datetime import datetime
import structlog

logger = structlog.get_logger()

# Try to import redis, but make it optional for environments without Redis
try:
    from redis import asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    logger.warning("Redis not available - caching will be disabled")
    REDIS_AVAILABLE = False


class CacheManager:
    """
    Redis-based caching with tenant-aware keys.
    
    Features:
    - Tenant-isolated cache keys for security
    - Automatic TTL management
    - Graceful degradation if Redis unavailable
    - JSON serialization for complex objects
    - Cache hit/miss metrics
    """
    
    def __init__(self, redis_url: Optional[str] = None):
        """
        Initialize cache manager.
        
        Args:
            redis_url: Redis connection URL (e.g., redis://localhost:6379/0)
                      If None, caching is disabled
        """
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None
        self.enabled = False
        self._cache_hits = 0
        self._cache_misses = 0
        
    async def initialize(self):
        """Initialize Redis connection"""
        if not REDIS_AVAILABLE or not self.redis_url:
            logger.warning("Redis caching disabled - no Redis URL provided or Redis not installed")
            return

        # Validate URL scheme to avoid noisy errors when unset/mis-set
        if not any(self.redis_url.startswith(scheme) for scheme in ("redis://", "rediss://", "unix://")):
            logger.warning("Redis caching disabled - invalid Redis URL scheme", redis_url=self.redis_url)
            return
        
        try:
            self.redis = await aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=5.0,
                socket_connect_timeout=5.0
            )
            
            # Test connection
            await self.redis.ping()
            self.enabled = True
            logger.info("✅ Redis cache manager initialized", redis_url=self.redis_url)
            
        except Exception as e:
            logger.error("❌ Failed to initialize Redis cache", error=str(e))
            self.enabled = False
    
    def _make_key(self, prefix: str, tenant_id: str, *args, **kwargs) -> str:
        """
        Generate tenant-aware cache key.
        
        Args:
            prefix: Cache key prefix (e.g., 'embedding', 'query')
            tenant_id: Tenant UUID for isolation
            *args, **kwargs: Additional key components
            
        Returns:
            MD5 hash of key components for consistent length
        """
        # Include tenant_id in key for security/isolation
        key_parts = [prefix, tenant_id]
        
        # Add positional arguments
        for arg in args:
            key_parts.append(str(arg))
        
        # Add keyword arguments (sorted for consistency)
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}={v}")
        
        # Create hash for consistent key length
        data = ":".join(key_parts)
        key_hash = hashlib.md5(data.encode()).hexdigest()
        
        # Include prefix for readability in Redis
        return f"vital:{prefix}:{tenant_id[:8]}:{key_hash}"
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get cached value by key.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        if not self.enabled or not self.redis:
            return None
        
        try:
            value = await self.redis.get(key)
            if value:
                self._cache_hits += 1
                logger.debug("Cache hit", key=key[:32])
                return json.loads(value)
            else:
                self._cache_misses += 1
                logger.debug("Cache miss", key=key[:32])
                return None
                
        except Exception as e:
            logger.error("Cache get failed", key=key[:32], error=str(e))
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600, tenant_id: Optional[str] = None):
        """
        Set cached value with TTL.

        Args:
            key: Cache key
            value: Value to cache (must be JSON-serializable)
            ttl: Time to live in seconds (default: 1 hour)
            tenant_id: Optional tenant ID for logging/metrics (key should already contain tenant isolation)
        """
        if not self.enabled or not self.redis:
            return

        try:
            serialized = json.dumps(value)
            await self.redis.setex(key, ttl, serialized)
            logger.debug("Cache set", key=key[:32], ttl=ttl, tenant_id=tenant_id[:8] if tenant_id else None)

        except Exception as e:
            logger.error("Cache set failed", key=key[:32], error=str(e))
    
    async def delete(self, key: str):
        """Delete cached value"""
        if not self.enabled or not self.redis:
            return
        
        try:
            await self.redis.delete(key)
            logger.debug("Cache delete", key=key[:32])
        except Exception as e:
            logger.error("Cache delete failed", key=key[:32], error=str(e))
    
    async def cache_embedding(self, tenant_id: str, text: str, embedding: List[float]):
        """
        Cache embedding vector (biggest cost savings).
        
        Args:
            tenant_id: Tenant UUID
            text: Input text that was embedded
            embedding: Embedding vector
        """
        key = self._make_key("embedding", tenant_id, text=text)
        # Embeddings cached for 24 hours (they don't change)
        await self.set(key, embedding, ttl=86400)
    
    async def get_cached_embedding(self, tenant_id: str, text: str) -> Optional[List[float]]:
        """
        Get cached embedding vector.
        
        Args:
            tenant_id: Tenant UUID
            text: Input text
            
        Returns:
            Embedding vector or None if not cached
        """
        key = self._make_key("embedding", tenant_id, text=text)
        return await self.get(key)
    
    async def cache_query_result(self, tenant_id: str, query: str, result: Dict[str, Any], agent_id: Optional[str] = None):
        """
        Cache query result.
        
        Args:
            tenant_id: Tenant UUID
            query: User query
            result: Query result
            agent_id: Optional agent ID for specificity
        """
        kwargs = {"query": query}
        if agent_id:
            kwargs["agent"] = agent_id
        
        key = self._make_key("query", tenant_id, **kwargs)
        # Query results cached for 1 hour
        await self.set(key, result, ttl=3600)
    
    async def get_cached_query_result(self, tenant_id: str, query: str, agent_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get cached query result.
        
        Args:
            tenant_id: Tenant UUID
            query: User query
            agent_id: Optional agent ID
            
        Returns:
            Cached result or None
        """
        kwargs = {"query": query}
        if agent_id:
            kwargs["agent"] = agent_id
        
        key = self._make_key("query", tenant_id, **kwargs)
        return await self.get(key)
    
    async def cache_rag_results(self, tenant_id: str, query: str, results: List[Dict[str, Any]]):
        """
        Cache RAG search results.
        
        Args:
            tenant_id: Tenant UUID
            query: Search query
            results: RAG search results
        """
        key = self._make_key("rag", tenant_id, query=query)
        # RAG results cached for 30 minutes
        await self.set(key, results, ttl=1800)
    
    async def get_cached_rag_results(self, tenant_id: str, query: str) -> Optional[List[Dict[str, Any]]]:
        """
        Get cached RAG search results.
        
        Args:
            tenant_id: Tenant UUID
            query: Search query
            
        Returns:
            Cached RAG results or None
        """
        key = self._make_key("rag", tenant_id, query=query)
        return await self.get(key)
    
    async def cache_agent_response(self, tenant_id: str, agent_id: str, query: str, response: Dict[str, Any]):
        """
        Cache agent response.
        
        Args:
            tenant_id: Tenant UUID
            agent_id: Agent identifier
            query: User query
            response: Agent response
        """
        key = self._make_key("agent_response", tenant_id, agent=agent_id, query=query)
        # Agent responses cached for 2 hours
        await self.set(key, response, ttl=7200)
    
    async def get_cached_agent_response(self, tenant_id: str, agent_id: str, query: str) -> Optional[Dict[str, Any]]:
        """Get cached agent response"""
        key = self._make_key("agent_response", tenant_id, agent=agent_id, query=query)
        return await self.get(key)
    
    async def invalidate_tenant_cache(self, tenant_id: str, pattern: Optional[str] = None):
        """
        Invalidate all cache entries for a tenant.
        
        Args:
            tenant_id: Tenant UUID
            pattern: Optional pattern to match (e.g., 'embedding', 'query')
        """
        if not self.enabled or not self.redis:
            return
        
        try:
            # Build pattern for scanning
            if pattern:
                scan_pattern = f"vital:{pattern}:{tenant_id[:8]}:*"
            else:
                scan_pattern = f"vital:*:{tenant_id[:8]}:*"
            
            # Scan and delete matching keys
            cursor = 0
            deleted_count = 0
            
            while True:
                cursor, keys = await self.redis.scan(cursor, match=scan_pattern, count=100)
                if keys:
                    await self.redis.delete(*keys)
                    deleted_count += len(keys)
                
                if cursor == 0:
                    break
            
            logger.info("Tenant cache invalidated", tenant_id=tenant_id[:8], deleted=deleted_count)
            
        except Exception as e:
            logger.error("Cache invalidation failed", tenant_id=tenant_id[:8], error=str(e))
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        if not self.enabled or not self.redis:
            return {
                "enabled": False,
                "hits": 0,
                "misses": 0,
                "hit_rate": 0.0
            }
        
        try:
            info = await self.redis.info("stats")
            
            total_requests = self._cache_hits + self._cache_misses
            hit_rate = self._cache_hits / total_requests if total_requests > 0 else 0.0
            
            return {
                "enabled": True,
                "hits": self._cache_hits,
                "misses": self._cache_misses,
                "hit_rate": round(hit_rate, 3),
                "total_keys": info.get("db0", {}).get("keys", 0),
                "memory_used": info.get("used_memory_human", "unknown")
            }
            
        except Exception as e:
            logger.error("Failed to get cache stats", error=str(e))
            return {
                "enabled": True,
                "error": str(e)
            }
    
    async def cleanup(self):
        """Cleanup Redis connection"""
        if self.redis:
            try:
                await self.redis.close()
                logger.info("🧹 Redis cache manager cleanup completed")
            except Exception as e:
                logger.error("Cache cleanup error", error=str(e))


# Global cache manager instance
_cache_manager: Optional[CacheManager] = None


def get_cache_manager() -> Optional[CacheManager]:
    """Get global cache manager instance"""
    return _cache_manager


async def initialize_cache_manager(redis_url: Optional[str] = None) -> CacheManager:
    """
    Initialize global cache manager.
    
    Args:
        redis_url: Redis connection URL
        
    Returns:
        Initialized cache manager
    """
    global _cache_manager
    
    _cache_manager = CacheManager(redis_url)
    await _cache_manager.initialize()
    
    return _cache_manager
