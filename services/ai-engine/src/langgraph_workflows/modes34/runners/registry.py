# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [services.supabase_client, langgraph_workflows.modes34.unified_autonomous_workflow, structlog]
"""
Runner Registry for Modes 3/4 - Production Database Integration

Phase 2 Complete: Dynamic runner/template loading from Supabase database.
Supports mission_templates table with caching and hot-reload capabilities.

Features:
- Load mission templates from database on startup
- Cache templates with configurable TTL (5 minutes default)
- Map template IDs to graph factories
- Support custom graph builders per template type
"""

from __future__ import annotations

import asyncio
import os
import time
from typing import Any, Callable, Dict, List, Optional, TYPE_CHECKING
import structlog

# Lazy import to avoid circular dependency with unified_autonomous_workflow.py
# build_master_graph is imported inside functions where needed
if TYPE_CHECKING:
    from ..unified_autonomous_workflow import build_master_graph as _build_master_graph_type

logger = structlog.get_logger()


def _get_default_graph_builder() -> Callable:
    """Lazy import of build_master_graph to avoid circular import."""
    from ..unified_autonomous_workflow import build_master_graph
    return build_master_graph

# =============================================================================
# Configuration
# =============================================================================

CACHE_TTL_SECONDS = int(os.getenv("RUNNER_CACHE_TTL", "300"))  # 5 minutes
DEFAULT_TEMPLATE_ID = "generic"

# =============================================================================
# Template Cache
# =============================================================================


class TemplateCache:
    """In-memory cache for mission templates with TTL."""

    def __init__(self, ttl_seconds: int = CACHE_TTL_SECONDS):
        self._templates: Dict[str, Dict[str, Any]] = {}
        self._last_refresh: float = 0.0
        self._ttl = ttl_seconds
        self._lock = asyncio.Lock()

    @property
    def is_stale(self) -> bool:
        return (time.time() - self._last_refresh) > self._ttl

    def get(self, template_id: str) -> Optional[Dict[str, Any]]:
        return self._templates.get(template_id)

    def get_all(self) -> Dict[str, Dict[str, Any]]:
        return self._templates.copy()

    def set(self, templates: Dict[str, Dict[str, Any]]) -> None:
        self._templates = templates
        self._last_refresh = time.time()

    def clear(self) -> None:
        self._templates.clear()
        self._last_refresh = 0.0


_template_cache = TemplateCache()


# =============================================================================
# Database Loading
# =============================================================================


async def _load_templates_from_db() -> Dict[str, Dict[str, Any]]:
    """
    Load mission templates from Supabase database.

    Returns:
        Dict mapping template_id/slug to template configuration
    """
    try:
        from services.supabase_client import get_supabase_client

        supabase = get_supabase_client()

        def _fetch():
            return supabase.client.table("mission_templates").select(
                "id, name, slug, description, category, tasks, "
                "default_checkpoints, estimated_duration_hours, "
                "difficulty_level, metadata"
            ).eq("is_active", True).execute()

        result = await asyncio.to_thread(_fetch)

        templates = {}
        for row in result.data or []:
            # Use slug as primary key, fallback to id
            key = row.get("slug") or str(row.get("id"))
            templates[key] = {
                "id": row.get("id"),
                "name": row.get("name"),
                "slug": row.get("slug"),
                "description": row.get("description"),
                "category": row.get("category"),
                "tasks": row.get("tasks") or [],
                "checkpoints": row.get("default_checkpoints") or [],
                "estimated_hours": row.get("estimated_duration_hours"),
                "difficulty": row.get("difficulty_level"),
                "metadata": row.get("metadata") or {},
            }

        logger.info(
            "mission_templates_loaded_from_db",
            count=len(templates),
            sample_templates=list(templates.keys())[:5],
        )

        return templates

    except asyncio.CancelledError:
        # CRITICAL C5 FIX: NEVER swallow CancelledError
        raise
    except Exception as exc:
        logger.error(
            "mission_templates_load_failed",
            error=str(exc)[:200],
            error_type=type(exc).__name__,
        )
        # CRITICAL C4 FIX: Raise exception instead of silent failure
        # Import here to avoid circular dependency
        from langgraph_workflows.modes34.resilience.exceptions import DatabaseConnectionError
        raise DatabaseConnectionError(
            table_name="mission_templates",
            operation="select",
            original_error=exc,
        )


async def refresh_template_cache(force: bool = False) -> int:
    """
    Refresh template cache from database.

    Args:
        force: Force refresh even if cache is not stale

    Returns:
        Number of templates loaded
    """
    async with _template_cache._lock:
        if not force and not _template_cache.is_stale:
            return len(_template_cache.get_all())

        templates = await _load_templates_from_db()
        _template_cache.set(templates)
        return len(templates)


def get_cached_templates() -> Dict[str, Dict[str, Any]]:
    """Get all cached templates (sync)."""
    return _template_cache.get_all()


def get_cached_template(template_id: str) -> Optional[Dict[str, Any]]:
    """Get a single cached template by ID/slug (sync)."""
    return _template_cache.get(template_id)


# =============================================================================
# Graph Factory Registry
# =============================================================================

# Custom graph builders for specific template types
# Format: template_slug -> graph_factory_function
CUSTOM_GRAPH_BUILDERS: Dict[str, Callable] = {
    # Add custom graph builders here as needed
    # "market_analysis": build_market_analysis_graph,
    # "regulatory_assessment": build_regulatory_graph,
}


def register_graph_builder(template_slug: str, builder: Callable) -> None:
    """
    Register a custom graph builder for a template type.

    Args:
        template_slug: Template slug/identifier
        builder: Callable that returns a compiled StateGraph
    """
    CUSTOM_GRAPH_BUILDERS[template_slug] = builder
    logger.info("custom_graph_builder_registered", template_slug=template_slug)


def get_graph_factory(template_id: str) -> Callable:
    """
    Get the graph factory for a template.

    Priority:
    1. Custom builder in CUSTOM_GRAPH_BUILDERS
    2. Template-specific builder from metadata
    3. Default build_master_graph

    Args:
        template_id: Template ID or slug

    Returns:
        Callable that builds the appropriate StateGraph
    """
    # Check custom builders first
    if template_id in CUSTOM_GRAPH_BUILDERS:
        logger.debug("using_custom_graph_builder", template_id=template_id)
        return CUSTOM_GRAPH_BUILDERS[template_id]

    # Check cached template for custom builder reference
    template = _template_cache.get(template_id)
    if template:
        metadata = template.get("metadata", {})
        builder_name = metadata.get("graph_builder")
        if builder_name and builder_name in CUSTOM_GRAPH_BUILDERS:
            logger.debug(
                "using_metadata_graph_builder",
                template_id=template_id,
                builder_name=builder_name,
            )
            return CUSTOM_GRAPH_BUILDERS[builder_name]

    # Default to master graph (lazy import)
    return _get_default_graph_builder()


# =============================================================================
# Runner Registry (Unified Interface)
# =============================================================================


class RunnerRegistry:
    """
    Unified runner/template registry with database + static fallback.

    Provides both sync and async interfaces for template access.
    """

    def __init__(self):
        self._static_runners: Dict[str, Dict[str, Any]] = {
            "generic": {
                "name": "Generic Mission Runner",
                "description": "Default mission execution graph",
                "category": "general",
            },
        }

    async def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """
        Get template by ID (async, with cache refresh).

        Args:
            template_id: Template ID or slug

        Returns:
            Template configuration or None
        """
        # Ensure cache is fresh
        if _template_cache.is_stale:
            await refresh_template_cache()

        # Check database templates first
        template = _template_cache.get(template_id)
        if template:
            return template

        # Fallback to static runners
        return self._static_runners.get(template_id)

    def get_template_sync(self, template_id: str) -> Optional[Dict[str, Any]]:
        """
        Get template by ID (sync, cache only).

        Args:
            template_id: Template ID or slug

        Returns:
            Template configuration or None
        """
        template = _template_cache.get(template_id)
        if template:
            return template
        return self._static_runners.get(template_id)

    async def list_templates(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        List available templates (async).

        Args:
            category: Optional category filter
            limit: Maximum templates to return

        Returns:
            List of template configurations
        """
        if _template_cache.is_stale:
            await refresh_template_cache()

        templates = list(_template_cache.get_all().values())

        # Add static runners
        for key, runner in self._static_runners.items():
            if not any(t.get("slug") == key for t in templates):
                templates.append({**runner, "slug": key, "source": "static"})

        # Filter by category
        if category:
            templates = [t for t in templates if t.get("category") == category]

        return templates[:limit]

    def get_graph_factory(self, template_id: str) -> Callable:
        """Get graph factory for template."""
        return get_graph_factory(template_id)


# Singleton instance
_runner_registry: Optional[RunnerRegistry] = None


def get_runner_registry() -> RunnerRegistry:
    """Get runner registry singleton."""
    global _runner_registry
    if _runner_registry is None:
        _runner_registry = RunnerRegistry()
    return _runner_registry


# =============================================================================
# Legacy Compatibility
# =============================================================================


class _LazyRunnerRegistry(dict):
    """Lazy dict that defers import of build_master_graph until first access."""

    _initialized: bool = False

    def _ensure_initialized(self):
        if not self._initialized:
            self["generic"] = _get_default_graph_builder()
            self._initialized = True

    def __getitem__(self, key):
        self._ensure_initialized()
        return super().__getitem__(key)

    def get(self, key, default=None):
        self._ensure_initialized()
        return super().get(key, default)

    def __contains__(self, key):
        self._ensure_initialized()
        return super().__contains__(key)


# Keep the original simple interface for backward compatibility
RUNNER_REGISTRY: Dict[str, Callable] = _LazyRunnerRegistry()


# =============================================================================
# Module Exports
# =============================================================================

__all__ = [
    "get_graph_factory",
    "register_graph_builder",
    "refresh_template_cache",
    "get_cached_templates",
    "get_cached_template",
    "get_runner_registry",
    "RunnerRegistry",
    "TemplateCache",
    "RUNNER_REGISTRY",
]
