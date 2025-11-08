"""
Selective Workflow Caching

Provides intelligent caching for workflow results:
- Cache Mode 1/2 only (research queries with consistent results)
- Skip Mode 3/4 (chat - context changes)
- 5-minute TTL (balance freshness vs. performance)
- Tenant-isolated cache keys
- Automatic cache invalidation

Benefits:
- Instant responses for repeated queries
- Cost savings (avoid duplicate LLM calls)
- Reduced load on backend services
- Better user experience

Usage:
    from vital_shared.utils.workflow_cache import cache_workflow_result, get_cached_workflow
    
    # Check cache
    cached = await get_cached_workflow(tenant_id, query, mode)
    if cached:
        return cached
    
    # Execute workflow
    result = await workflow.execute_typed(input)
    
    # Cache result (if cacheable)
    await cache_workflow_result(tenant_id, query, mode, result)
"""

import hashlib
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger(__name__)

# ============================================================================
# In-Memory Cache (Production: Use Redis/Memcached)
# ============================================================================

_cache: Dict[str, tuple[Any, datetime]] = {}
_cache_hits = 0
_cache_misses = 0

# Configuration
CACHE_TTL_SECONDS = 300  # 5 minutes
MAX_CACHE_SIZE = 1000  # Max cached items
CACHEABLE_MODES = ["1", "2"]  # Mode 1 (Manual) and Mode 2 (Auto)


def _generate_cache_key(tenant_id: str, query: str, mode: str) -> str:
    """
    Generate deterministic cache key.
    
    Format: {tenant_id}:{mode}:{query_hash}
    
    Args:
        tenant_id: Tenant identifier (for isolation)
        query: User query
        mode: Workflow mode
    
    Returns:
        Cache key (SHA-256 hash)
    """
    # Normalize query (lowercase, strip whitespace)
    normalized_query = query.lower().strip()
    
    # Create composite key
    composite = f"{tenant_id}:{mode}:{normalized_query}"
    
    # Hash for consistent key length
    query_hash = hashlib.sha256(composite.encode()).hexdigest()[:16]
    
    return f"{tenant_id}:{mode}:{query_hash}"


def _is_cacheable(mode: str, input_data: Dict[str, Any]) -> bool:
    """
    Determine if workflow result should be cached.
    
    Caching Rules:
    - Mode 1/2 only (research queries)
    - Not Mode 3/4 (chat - context changes)
    - No user-specific overrides (e.g., skip_tool_confirmation)
    
    Args:
        mode: Workflow mode
        input_data: Workflow input data
    
    Returns:
        True if cacheable, False otherwise
    """
    # Only cache Mode 1/2
    if mode not in CACHEABLE_MODES:
        return False
    
    # Don't cache if user disabled tools/RAG
    if not input_data.get("enable_rag", True):
        return False
    
    if not input_data.get("enable_tools", True):
        return False
    
    # Don't cache if user requested specific tools
    if input_data.get("requested_tools"):
        return False
    
    # Don't cache if user skipped confirmation
    if input_data.get("skip_tool_confirmation", False):
        return False
    
    return True


def _evict_oldest_entries():
    """
    Evict oldest cache entries if cache is full.
    
    Implements LRU (Least Recently Used) eviction.
    """
    global _cache
    
    if len(_cache) <= MAX_CACHE_SIZE:
        return
    
    # Sort by timestamp (oldest first)
    sorted_entries = sorted(_cache.items(), key=lambda x: x[1][1])
    
    # Remove oldest 10%
    num_to_remove = max(1, int(MAX_CACHE_SIZE * 0.1))
    keys_to_remove = [key for key, _ in sorted_entries[:num_to_remove]]
    
    for key in keys_to_remove:
        del _cache[key]
    
    logger.info(
        "cache_eviction",
        removed_count=len(keys_to_remove),
        cache_size=len(_cache)
    )


async def get_cached_workflow(
    tenant_id: str,
    query: str,
    mode: str
) -> Optional[Dict[str, Any]]:
    """
    Get cached workflow result if available.
    
    Args:
        tenant_id: Tenant identifier
        query: User query
        mode: Workflow mode
    
    Returns:
        Cached result or None if not found/expired
    """
    global _cache_hits, _cache_misses
    
    # Generate cache key
    cache_key = _generate_cache_key(tenant_id, query, mode)
    
    # Check if entry exists
    if cache_key not in _cache:
        _cache_misses += 1
        logger.debug("cache_miss", cache_key=cache_key, mode=mode)
        return None
    
    # Get entry
    cached_result, cached_at = _cache[cache_key]
    
    # Check if expired
    age_seconds = (datetime.now() - cached_at).total_seconds()
    if age_seconds > CACHE_TTL_SECONDS:
        # Remove expired entry
        del _cache[cache_key]
        _cache_misses += 1
        logger.debug(
            "cache_expired",
            cache_key=cache_key,
            age_seconds=age_seconds,
            ttl=CACHE_TTL_SECONDS
        )
        return None
    
    # Cache hit!
    _cache_hits += 1
    logger.info(
        "cache_hit",
        cache_key=cache_key,
        mode=mode,
        age_seconds=age_seconds,
        hit_rate=_cache_hits / (_cache_hits + _cache_misses) if (_cache_hits + _cache_misses) > 0 else 0
    )
    
    return cached_result


async def cache_workflow_result(
    tenant_id: str,
    query: str,
    mode: str,
    result: Dict[str, Any],
    input_data: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Cache workflow result if cacheable.
    
    Args:
        tenant_id: Tenant identifier
        query: User query
        mode: Workflow mode
        result: Workflow result to cache
        input_data: Original input data (for cacheability check)
    
    Returns:
        True if cached, False if not cacheable
    """
    global _cache
    
    # Check if cacheable
    if input_data and not _is_cacheable(mode, input_data):
        logger.debug("workflow_not_cacheable", mode=mode, reason="user_overrides_or_chat_mode")
        return False
    
    if mode not in CACHEABLE_MODES:
        logger.debug("workflow_not_cacheable", mode=mode, reason="chat_mode")
        return False
    
    # Check quality score (don't cache low-quality results)
    quality_score = result.get("quality_score", 1.0)
    if quality_score < 0.8:
        logger.debug(
            "workflow_not_cacheable",
            mode=mode,
            reason="low_quality",
            quality_score=quality_score
        )
        return False
    
    # Generate cache key
    cache_key = _generate_cache_key(tenant_id, query, mode)
    
    # Evict old entries if needed
    _evict_oldest_entries()
    
    # Store in cache
    _cache[cache_key] = (result, datetime.now())
    
    logger.info(
        "workflow_cached",
        cache_key=cache_key,
        mode=mode,
        quality_score=quality_score,
        cache_size=len(_cache)
    )
    
    return True


def invalidate_cache(
    tenant_id: Optional[str] = None,
    mode: Optional[str] = None
):
    """
    Invalidate cache entries.
    
    Args:
        tenant_id: Invalidate all entries for tenant (None = all tenants)
        mode: Invalidate all entries for mode (None = all modes)
    """
    global _cache
    
    if tenant_id is None and mode is None:
        # Clear entire cache
        _cache.clear()
        logger.info("cache_invalidated", scope="all")
        return
    
    # Filter and remove matching entries
    keys_to_remove = []
    for cache_key in _cache.keys():
        parts = cache_key.split(":")
        if len(parts) < 2:
            continue
        
        key_tenant_id = parts[0]
        key_mode = parts[1]
        
        # Check if matches filter
        if tenant_id and key_tenant_id != tenant_id:
            continue
        
        if mode and key_mode != mode:
            continue
        
        keys_to_remove.append(cache_key)
    
    # Remove matching entries
    for key in keys_to_remove:
        del _cache[key]
    
    logger.info(
        "cache_invalidated",
        scope="filtered",
        tenant_id=tenant_id,
        mode=mode,
        removed_count=len(keys_to_remove)
    )


def get_cache_stats() -> Dict[str, Any]:
    """
    Get cache statistics.
    
    Returns:
        Dict with cache metrics
    """
    global _cache_hits, _cache_misses, _cache
    
    total_requests = _cache_hits + _cache_misses
    hit_rate = (_cache_hits / total_requests) if total_requests > 0 else 0
    
    # Calculate average age
    if _cache:
        now = datetime.now()
        ages = [(now - cached_at).total_seconds() for _, cached_at in _cache.values()]
        avg_age = sum(ages) / len(ages)
    else:
        avg_age = 0
    
    return {
        "cache_size": len(_cache),
        "max_cache_size": MAX_CACHE_SIZE,
        "cache_hits": _cache_hits,
        "cache_misses": _cache_misses,
        "total_requests": total_requests,
        "hit_rate": hit_rate,
        "hit_rate_percent": f"{hit_rate * 100:.1f}%",
        "avg_entry_age_seconds": avg_age,
        "ttl_seconds": CACHE_TTL_SECONDS
    }


def reset_cache_stats():
    """Reset cache statistics (for testing)"""
    global _cache_hits, _cache_misses, _cache
    _cache_hits = 0
    _cache_misses = 0
    _cache.clear()


# ============================================================================
# Cache Decorator (for easy integration)
# ============================================================================

def cached_workflow(mode_filter: Optional[list] = None):
    """
    Decorator for caching workflow execution.
    
    Args:
        mode_filter: List of modes to cache (default: ["1", "2"])
    
    Usage:
        @cached_workflow(mode_filter=["1", "2"])
        async def execute_workflow(tenant_id, query, mode):
            # Workflow execution
            return result
    """
    if mode_filter is None:
        mode_filter = CACHEABLE_MODES
    
    def decorator(func):
        async def wrapper(tenant_id: str, query: str, mode: str, *args, **kwargs):
            # Check cache
            if mode in mode_filter:
                cached = await get_cached_workflow(tenant_id, query, mode)
                if cached:
                    return cached
            
            # Execute function
            result = await func(tenant_id, query, mode, *args, **kwargs)
            
            # Cache result
            if mode in mode_filter:
                await cache_workflow_result(tenant_id, query, mode, result)
            
            return result
        
        return wrapper
    return decorator


# ============================================================================
# Usage Examples
# ============================================================================

"""
Example 1: Manual caching

    from vital_shared.utils.workflow_cache import get_cached_workflow, cache_workflow_result
    
    # Check cache
    cached = await get_cached_workflow("tenant123", "What are FDA regulations?", "1")
    if cached:
        return cached
    
    # Execute workflow
    result = await workflow.execute_typed(input)
    
    # Cache result
    await cache_workflow_result("tenant123", "What are FDA regulations?", "1", result)


Example 2: Using decorator

    from vital_shared.utils.workflow_cache import cached_workflow
    
    @cached_workflow(mode_filter=["1", "2"])
    async def execute_workflow(tenant_id, query, mode):
        result = await workflow.execute_typed(input)
        return result


Example 3: Cache invalidation

    from vital_shared.utils.workflow_cache import invalidate_cache
    
    # Invalidate all cache
    invalidate_cache()
    
    # Invalidate tenant cache
    invalidate_cache(tenant_id="tenant123")
    
    # Invalidate mode cache
    invalidate_cache(mode="1")


Example 4: Cache statistics

    from vital_shared.utils.workflow_cache import get_cache_stats
    
    stats = get_cache_stats()
    print(f"Hit rate: {stats['hit_rate_percent']}")
    print(f"Cache size: {stats['cache_size']}/{stats['max_cache_size']}")
"""

