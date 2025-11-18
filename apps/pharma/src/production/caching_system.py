"""
VITAL Path Phase 3: Production Caching System
High-performance caching system with multiple backends and intelligent cache management.
"""

import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Union, Callable
from enum import Enum
import json
from datetime import datetime, timedelta
import logging
import hashlib
import pickle
import redis.asyncio as redis
import memcache
from abc import ABC, abstractmethod
import gzip
import lz4.frame
import weakref

class CacheBackend(Enum):
    MEMORY = "memory"
    REDIS = "redis"
    MEMCACHED = "memcached"
    HYBRID = "hybrid"

class CompressionType(Enum):
    NONE = "none"
    GZIP = "gzip"
    LZ4 = "lz4"

class EvictionPolicy(Enum):
    LRU = "lru"
    LFU = "lfu"
    TTL = "ttl"
    FIFO = "fifo"

@dataclass
class CacheItem:
    key: str
    value: Any
    created_at: datetime
    expires_at: Optional[datetime]
    access_count: int = 0
    last_accessed: datetime = field(default_factory=datetime.now)
    size_bytes: int = 0
    compressed: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class CacheConfig:
    backend: CacheBackend
    max_size_mb: int = 100
    default_ttl_seconds: int = 3600
    compression: CompressionType = CompressionType.NONE
    eviction_policy: EvictionPolicy = EvictionPolicy.LRU
    redis_url: Optional[str] = None
    memcached_servers: List[str] = field(default_factory=list)
    enable_metrics: bool = True

@dataclass
class CacheMetrics:
    hits: int = 0
    misses: int = 0
    sets: int = 0
    deletes: int = 0
    evictions: int = 0
    size_bytes: int = 0
    item_count: int = 0
    hit_rate: float = 0.0

class CacheBackendInterface(ABC):
    """Abstract interface for cache backends."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        pass

    @abstractmethod
    async def clear(self) -> bool:
        pass

    @abstractmethod
    async def get_stats(self) -> Dict[str, Any]:
        pass

class InMemoryCache(CacheBackendInterface):
    """High-performance in-memory cache with LRU eviction."""

    def __init__(self, config: CacheConfig):
        self.config = config
        self.data: Dict[str, CacheItem] = {}
        self.access_order: List[str] = []
        self.max_size_bytes = config.max_size_mb * 1024 * 1024
        self.current_size_bytes = 0
        self.logger = logging.getLogger(__name__)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            if key not in self.data:
                return None

            item = self.data[key]

            # Check expiration
            if item.expires_at and datetime.now() > item.expires_at:
                await self._remove_item(key)
                return None

            # Update access statistics
            item.access_count += 1
            item.last_accessed = datetime.now()

            # Update LRU order
            if key in self.access_order:
                self.access_order.remove(key)
            self.access_order.append(key)

            # Decompress if needed
            value = item.value
            if item.compressed:
                value = await self._decompress_value(value, self.config.compression)

            return value

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        async with self._lock:
            try:
                # Calculate TTL
                expires_at = None
                if ttl:
                    expires_at = datetime.now() + timedelta(seconds=ttl)
                elif self.config.default_ttl_seconds > 0:
                    expires_at = datetime.now() + timedelta(seconds=self.config.default_ttl_seconds)

                # Compress value if configured
                compressed_value = value
                compressed = False
                if self.config.compression != CompressionType.NONE:
                    compressed_value = await self._compress_value(value, self.config.compression)
                    compressed = True

                # Calculate size
                size_bytes = await self._calculate_size(compressed_value)

                # Check if we need to evict items
                while (self.current_size_bytes + size_bytes > self.max_size_bytes and
                       self.access_order):
                    await self._evict_item()

                # Remove existing item if present
                if key in self.data:
                    await self._remove_item(key)

                # Create new item
                item = CacheItem(
                    key=key,
                    value=compressed_value,
                    created_at=datetime.now(),
                    expires_at=expires_at,
                    size_bytes=size_bytes,
                    compressed=compressed
                )

                # Store item
                self.data[key] = item
                self.access_order.append(key)
                self.current_size_bytes += size_bytes

                return True

            except Exception as e:
                self.logger.error(f"Error setting cache item {key}: {str(e)}")
                return False

    async def delete(self, key: str) -> bool:
        async with self._lock:
            if key in self.data:
                await self._remove_item(key)
                return True
            return False

    async def exists(self, key: str) -> bool:
        async with self._lock:
            if key not in self.data:
                return False

            item = self.data[key]
            if item.expires_at and datetime.now() > item.expires_at:
                await self._remove_item(key)
                return False

            return True

    async def clear(self) -> bool:
        async with self._lock:
            self.data.clear()
            self.access_order.clear()
            self.current_size_bytes = 0
            return True

    async def get_stats(self) -> Dict[str, Any]:
        async with self._lock:
            return {
                "item_count": len(self.data),
                "size_bytes": self.current_size_bytes,
                "size_mb": self.current_size_bytes / (1024 * 1024),
                "max_size_mb": self.config.max_size_mb,
                "utilization": self.current_size_bytes / self.max_size_bytes
            }

    async def _remove_item(self, key: str):
        """Remove an item from cache."""
        if key in self.data:
            item = self.data[key]
            self.current_size_bytes -= item.size_bytes
            del self.data[key]

        if key in self.access_order:
            self.access_order.remove(key)

    async def _evict_item(self):
        """Evict an item based on eviction policy."""
        if not self.access_order:
            return

        if self.config.eviction_policy == EvictionPolicy.LRU:
            # Evict least recently used
            key_to_evict = self.access_order[0]
        elif self.config.eviction_policy == EvictionPolicy.LFU:
            # Evict least frequently used
            key_to_evict = min(self.data.keys(),
                              key=lambda k: self.data[k].access_count)
        elif self.config.eviction_policy == EvictionPolicy.TTL:
            # Evict item with earliest expiration
            expired_items = [k for k, v in self.data.items()
                           if v.expires_at and datetime.now() > v.expires_at]
            if expired_items:
                key_to_evict = expired_items[0]
            else:
                key_to_evict = self.access_order[0]  # Fallback to LRU
        else:  # FIFO
            key_to_evict = min(self.data.keys(),
                              key=lambda k: self.data[k].created_at)

        await self._remove_item(key_to_evict)

    async def _compress_value(self, value: Any, compression: CompressionType) -> bytes:
        """Compress a value using specified compression."""
        serialized = pickle.dumps(value)

        if compression == CompressionType.GZIP:
            return gzip.compress(serialized)
        elif compression == CompressionType.LZ4:
            return lz4.frame.compress(serialized)
        else:
            return serialized

    async def _decompress_value(self, compressed_value: bytes, compression: CompressionType) -> Any:
        """Decompress a value using specified compression."""
        if compression == CompressionType.GZIP:
            decompressed = gzip.decompress(compressed_value)
        elif compression == CompressionType.LZ4:
            decompressed = lz4.frame.decompress(compressed_value)
        else:
            decompressed = compressed_value

        return pickle.loads(decompressed)

    async def _calculate_size(self, value: Any) -> int:
        """Calculate approximate size of a value in bytes."""
        try:
            if isinstance(value, bytes):
                return len(value)
            elif isinstance(value, str):
                return len(value.encode('utf-8'))
            else:
                return len(pickle.dumps(value))
        except Exception:
            return 1024  # Default estimate

class RedisCache(CacheBackendInterface):
    """Redis-based cache backend."""

    def __init__(self, config: CacheConfig):
        self.config = config
        self.redis_client = None
        self.logger = logging.getLogger(__name__)

    async def _get_client(self):
        """Get or create Redis client."""
        if not self.redis_client:
            self.redis_client = redis.from_url(
                self.config.redis_url or "redis://localhost:6379"
            )
        return self.redis_client

    async def get(self, key: str) -> Optional[Any]:
        try:
            client = await self._get_client()
            value = await client.get(key)

            if value is None:
                return None

            # Deserialize
            if isinstance(value, bytes):
                if self.config.compression != CompressionType.NONE:
                    value = await self._decompress_value(value, self.config.compression)
                else:
                    value = pickle.loads(value)

            return value

        except Exception as e:
            self.logger.error(f"Redis get error for key {key}: {str(e)}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            client = await self._get_client()

            # Serialize and optionally compress
            if self.config.compression != CompressionType.NONE:
                serialized = await self._compress_value(value, self.config.compression)
            else:
                serialized = pickle.dumps(value)

            # Set TTL
            effective_ttl = ttl or self.config.default_ttl_seconds

            if effective_ttl > 0:
                await client.setex(key, effective_ttl, serialized)
            else:
                await client.set(key, serialized)

            return True

        except Exception as e:
            self.logger.error(f"Redis set error for key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        try:
            client = await self._get_client()
            result = await client.delete(key)
            return result > 0
        except Exception as e:
            self.logger.error(f"Redis delete error for key {key}: {str(e)}")
            return False

    async def exists(self, key: str) -> bool:
        try:
            client = await self._get_client()
            result = await client.exists(key)
            return result > 0
        except Exception as e:
            self.logger.error(f"Redis exists error for key {key}: {str(e)}")
            return False

    async def clear(self) -> bool:
        try:
            client = await self._get_client()
            await client.flushdb()
            return True
        except Exception as e:
            self.logger.error(f"Redis clear error: {str(e)}")
            return False

    async def get_stats(self) -> Dict[str, Any]:
        try:
            client = await self._get_client()
            info = await client.info()
            return {
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory", 0),
                "used_memory_human": info.get("used_memory_human", "0B"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0)
            }
        except Exception as e:
            self.logger.error(f"Redis stats error: {str(e)}")
            return {}

    async def _compress_value(self, value: Any, compression: CompressionType) -> bytes:
        """Compress a value using specified compression."""
        serialized = pickle.dumps(value)

        if compression == CompressionType.GZIP:
            return gzip.compress(serialized)
        elif compression == CompressionType.LZ4:
            return lz4.frame.compress(serialized)
        else:
            return serialized

    async def _decompress_value(self, compressed_value: bytes, compression: CompressionType) -> Any:
        """Decompress a value using specified compression."""
        if compression == CompressionType.GZIP:
            decompressed = gzip.decompress(compressed_value)
        elif compression == CompressionType.LZ4:
            decompressed = lz4.frame.decompress(compressed_value)
        else:
            decompressed = compressed_value

        return pickle.loads(decompressed)

class CacheManager:
    """High-level cache manager with multiple backends and intelligent caching strategies."""

    def __init__(self, configs: Dict[str, CacheConfig]):
        self.configs = configs
        self.backends: Dict[str, CacheBackendInterface] = {}
        self.metrics: Dict[str, CacheMetrics] = {}
        self.logger = logging.getLogger(__name__)

        # Initialize backends
        for name, config in configs.items():
            if config.backend == CacheBackend.MEMORY:
                self.backends[name] = InMemoryCache(config)
            elif config.backend == CacheBackend.REDIS:
                self.backends[name] = RedisCache(config)
            # Add other backends as needed

            if config.enable_metrics:
                self.metrics[name] = CacheMetrics()

    async def get(self, key: str, cache_name: str = "default") -> Optional[Any]:
        """Get value from cache."""
        if cache_name not in self.backends:
            return None

        try:
            backend = self.backends[cache_name]
            value = await backend.get(key)

            # Update metrics
            if cache_name in self.metrics:
                if value is not None:
                    self.metrics[cache_name].hits += 1
                else:
                    self.metrics[cache_name].misses += 1
                await self._update_hit_rate(cache_name)

            return value

        except Exception as e:
            self.logger.error(f"Cache get error: {str(e)}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None,
                 cache_name: str = "default") -> bool:
        """Set value in cache."""
        if cache_name not in self.backends:
            return False

        try:
            backend = self.backends[cache_name]
            result = await backend.set(key, value, ttl)

            # Update metrics
            if cache_name in self.metrics and result:
                self.metrics[cache_name].sets += 1

            return result

        except Exception as e:
            self.logger.error(f"Cache set error: {str(e)}")
            return False

    async def delete(self, key: str, cache_name: str = "default") -> bool:
        """Delete value from cache."""
        if cache_name not in self.backends:
            return False

        try:
            backend = self.backends[cache_name]
            result = await backend.delete(key)

            # Update metrics
            if cache_name in self.metrics and result:
                self.metrics[cache_name].deletes += 1

            return result

        except Exception as e:
            self.logger.error(f"Cache delete error: {str(e)}")
            return False

    async def exists(self, key: str, cache_name: str = "default") -> bool:
        """Check if key exists in cache."""
        if cache_name not in self.backends:
            return False

        try:
            backend = self.backends[cache_name]
            return await backend.exists(key)
        except Exception as e:
            self.logger.error(f"Cache exists error: {str(e)}")
            return False

    async def clear(self, cache_name: str = "default") -> bool:
        """Clear cache."""
        if cache_name not in self.backends:
            return False

        try:
            backend = self.backends[cache_name]
            result = await backend.clear()

            # Reset metrics
            if cache_name in self.metrics:
                self.metrics[cache_name] = CacheMetrics()

            return result

        except Exception as e:
            self.logger.error(f"Cache clear error: {str(e)}")
            return False

    async def get_or_set(self, key: str, factory: Callable[[], Any],
                        ttl: Optional[int] = None, cache_name: str = "default") -> Any:
        """Get value from cache or set it using factory function."""
        # Try to get from cache first
        value = await self.get(key, cache_name)
        if value is not None:
            return value

        # Generate value using factory
        try:
            if asyncio.iscoroutinefunction(factory):
                value = await factory()
            else:
                value = factory()

            # Cache the value
            await self.set(key, value, ttl, cache_name)
            return value

        except Exception as e:
            self.logger.error(f"Factory function error for key {key}: {str(e)}")
            raise

    async def _update_hit_rate(self, cache_name: str):
        """Update hit rate metric."""
        if cache_name not in self.metrics:
            return

        metrics = self.metrics[cache_name]
        total = metrics.hits + metrics.misses
        if total > 0:
            metrics.hit_rate = metrics.hits / total

    async def get_metrics(self, cache_name: str = "default") -> Optional[CacheMetrics]:
        """Get cache metrics."""
        return self.metrics.get(cache_name)

    async def get_all_metrics(self) -> Dict[str, CacheMetrics]:
        """Get metrics for all caches."""
        return self.metrics.copy()

    async def get_backend_stats(self, cache_name: str = "default") -> Dict[str, Any]:
        """Get backend-specific statistics."""
        if cache_name not in self.backends:
            return {}

        try:
            backend = self.backends[cache_name]
            return await backend.get_stats()
        except Exception as e:
            self.logger.error(f"Error getting backend stats: {str(e)}")
            return {}

    def cache_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments."""
        key_parts = []

        # Add positional arguments
        for arg in args:
            if isinstance(arg, (str, int, float, bool)):
                key_parts.append(str(arg))
            else:
                key_parts.append(hashlib.md5(str(arg).encode()).hexdigest()[:8])

        # Add keyword arguments
        for k, v in sorted(kwargs.items()):
            if isinstance(v, (str, int, float, bool)):
                key_parts.append(f"{k}:{v}")
            else:
                key_parts.append(f"{k}:{hashlib.md5(str(v).encode()).hexdigest()[:8]}")

        return ":".join(key_parts)

    def cached(self, ttl: int = 3600, cache_name: str = "default", key_func: Optional[Callable] = None):
        """Decorator for caching function results."""
        def decorator(func):
            async def async_wrapper(*args, **kwargs):
                # Generate cache key
                if key_func:
                    if asyncio.iscoroutinefunction(key_func):
                        cache_key = await key_func(*args, **kwargs)
                    else:
                        cache_key = key_func(*args, **kwargs)
                else:
                    cache_key = f"{func.__name__}:{self.cache_key(*args, **kwargs)}"

                # Try to get from cache
                cached_result = await self.get(cache_key, cache_name)
                if cached_result is not None:
                    return cached_result

                # Execute function and cache result
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)

                await self.set(cache_key, result, ttl, cache_name)
                return result

            def sync_wrapper(*args, **kwargs):
                # For synchronous functions, we need to run in event loop
                try:
                    loop = asyncio.get_event_loop()
                    return loop.run_until_complete(async_wrapper(*args, **kwargs))
                except RuntimeError:
                    # No event loop running, create a new one
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        return loop.run_until_complete(async_wrapper(*args, **kwargs))
                    finally:
                        loop.close()

            if asyncio.iscoroutinefunction(func):
                return async_wrapper
            else:
                return sync_wrapper

        return decorator

# Cache warming and preloading utilities
class CacheWarmer:
    """Utility for warming cache with frequently accessed data."""

    def __init__(self, cache_manager: CacheManager):
        self.cache_manager = cache_manager
        self.logger = logging.getLogger(__name__)

    async def warm_cache(self, warming_config: Dict[str, Any]):
        """Warm cache based on configuration."""
        for cache_name, config in warming_config.items():
            try:
                await self._warm_single_cache(cache_name, config)
            except Exception as e:
                self.logger.error(f"Error warming cache {cache_name}: {str(e)}")

    async def _warm_single_cache(self, cache_name: str, config: Dict[str, Any]):
        """Warm a single cache."""
        data_source = config.get("data_source")
        key_pattern = config.get("key_pattern", "{id}")
        ttl = config.get("ttl", 3600)

        if not data_source:
            return

        # Load data from source
        if callable(data_source):
            if asyncio.iscoroutinefunction(data_source):
                data = await data_source()
            else:
                data = data_source()
        else:
            data = data_source

        # Cache each item
        if isinstance(data, dict):
            for key, value in data.items():
                cache_key = key_pattern.format(id=key)
                await self.cache_manager.set(cache_key, value, ttl, cache_name)

        elif isinstance(data, list):
            for i, value in enumerate(data):
                cache_key = key_pattern.format(id=i)
                await self.cache_manager.set(cache_key, value, ttl, cache_name)

        self.logger.info(f"Warmed cache {cache_name} with {len(data) if hasattr(data, '__len__') else 'N/A'} items")

# Example usage and testing
async def main():
    """Test the caching system."""

    # Configure multiple cache backends
    cache_configs = {
        "default": CacheConfig(
            backend=CacheBackend.MEMORY,
            max_size_mb=50,
            default_ttl_seconds=3600,
            compression=CompressionType.LZ4,
            eviction_policy=EvictionPolicy.LRU
        ),
        "sessions": CacheConfig(
            backend=CacheBackend.MEMORY,
            max_size_mb=10,
            default_ttl_seconds=1800,
            eviction_policy=EvictionPolicy.TTL
        ),
        "distributed": CacheConfig(
            backend=CacheBackend.REDIS,
            default_ttl_seconds=7200,
            compression=CompressionType.GZIP,
            redis_url="redis://localhost:6379"
        )
    }

    # Initialize cache manager
    cache_manager = CacheManager(cache_configs)

    # Test basic operations
    await cache_manager.set("test_key", {"data": "test_value", "timestamp": datetime.now()})

    cached_value = await cache_manager.get("test_key")
    print(f"Cached value: {cached_value}")

    # Test get_or_set
    def expensive_computation():
        import time
        time.sleep(0.1)  # Simulate expensive operation
        return {"result": "computed_value", "computed_at": datetime.now()}

    result = await cache_manager.get_or_set("expensive_key", expensive_computation, ttl=300)
    print(f"Computed result: {result}")

    # Test cached decorator
    @cache_manager.cached(ttl=600, cache_name="default")
    async def expensive_async_function(x: int, y: int) -> int:
        await asyncio.sleep(0.1)  # Simulate async work
        return x * y + x ** y

    result1 = await expensive_async_function(5, 3)
    result2 = await expensive_async_function(5, 3)  # Should be cached
    print(f"Function results: {result1}, {result2}")

    # Get metrics
    metrics = await cache_manager.get_metrics("default")
    if metrics:
        print(f"Cache metrics - Hits: {metrics.hits}, Misses: {metrics.misses}, Hit rate: {metrics.hit_rate:.2%}")

    # Get backend stats
    stats = await cache_manager.get_backend_stats("default")
    print(f"Backend stats: {stats}")

    print("Caching system test completed!")

if __name__ == "__main__":
    asyncio.run(main())