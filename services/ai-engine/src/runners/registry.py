"""
Runner Registry - Central registration and discovery of all 207 runners
"""

from __future__ import annotations

from typing import Dict, List, Optional, Type
from dataclasses import dataclass
import structlog

from .base import BaseRunner, RunnerCategory, PharmaDomain

logger = structlog.get_logger()


@dataclass
class RunnerMetadata:
    """Metadata for registered runner"""
    runner_id: str
    name: str
    category: RunnerCategory
    domain: Optional[PharmaDomain]
    description: str
    runner_class: Type[BaseRunner]
    version: str = "1.0.0"
    is_active: bool = True


class RunnerRegistry:
    """
    Central registry for all mission runners.

    Provides:
    - Runner registration and discovery
    - Category-based filtering
    - Domain-based filtering
    - Runner instantiation
    """

    _instance: Optional['RunnerRegistry'] = None
    _runners: Dict[str, RunnerMetadata] = {}
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._runners = {}
            cls._initialized = False
        return cls._instance

    @classmethod
    def register(
        cls,
        runner_class: Type[BaseRunner],
        version: str = "1.0.0",
    ) -> None:
        """Register a runner class"""
        try:
            instance = runner_class()
            metadata = RunnerMetadata(
                runner_id=instance.runner_id,
                name=instance.name,
                category=instance.category,
                domain=instance.domain,
                description=instance.description,
                runner_class=runner_class,
                version=version,
            )
            cls._runners[instance.runner_id] = metadata
            logger.debug(
                "runner_registered",
                runner_id=instance.runner_id,
                category=instance.category.value,
            )
        except Exception as exc:
            logger.error("runner_registration_failed", error=str(exc))

    @classmethod
    def get(cls, runner_id: str) -> Optional[BaseRunner]:
        """Get runner instance by ID"""
        cls._ensure_initialized()
        metadata = cls._runners.get(runner_id)
        if metadata and metadata.is_active:
            return metadata.runner_class()
        return None

    @classmethod
    def get_by_category(
        cls,
        category: RunnerCategory
    ) -> List[BaseRunner]:
        """Get all runners in a category"""
        cls._ensure_initialized()
        return [
            m.runner_class()
            for m in cls._runners.values()
            if m.category == category and m.is_active
        ]

    @classmethod
    def get_by_domain(
        cls,
        domain: PharmaDomain
    ) -> List[BaseRunner]:
        """Get all runners for a pharmaceutical domain"""
        cls._ensure_initialized()
        return [
            m.runner_class()
            for m in cls._runners.values()
            if m.domain == domain and m.is_active
        ]

    @classmethod
    def list_all(cls) -> List[RunnerMetadata]:
        """List all registered runners"""
        cls._ensure_initialized()
        return list(cls._runners.values())

    @classmethod
    def list_ids(cls) -> List[str]:
        """List all registered runner IDs"""
        cls._ensure_initialized()
        return list(cls._runners.keys())

    @classmethod
    def count(cls) -> Dict[str, int]:
        """Get runner counts by category and domain"""
        cls._ensure_initialized()
        by_category: Dict[str, int] = {}
        by_domain: Dict[str, int] = {}

        for m in cls._runners.values():
            cat = m.category.value
            by_category[cat] = by_category.get(cat, 0) + 1

            if m.domain:
                dom = m.domain.value
                by_domain[dom] = by_domain.get(dom, 0) + 1

        return {
            "total": len(cls._runners),
            "by_category": by_category,
            "by_domain": by_domain,
        }

    @classmethod
    def _ensure_initialized(cls) -> None:
        """Ensure runners are registered on first access"""
        if not cls._initialized:
            _register_core_runners()
            cls._initialized = True


def _register_core_runners() -> None:
    """Register all core cognitive runners"""
    try:
        from .core.critique import CritiqueRunner, CritiqueAdvancedRunner
        from .core.synthesize import SynthesizeRunner, SynthesizeAdvancedRunner
        from .core.decompose import DecomposeRunner, DecomposeAdvancedRunner
        from .core.investigate import InvestigateRunner, InvestigateAdvancedRunner
        from .core.validate import ValidateRunner, ValidateAdvancedRunner
        from .core.recommend import RecommendRunner, RecommendAdvancedRunner

        runners = [
            CritiqueRunner,
            CritiqueAdvancedRunner,
            SynthesizeRunner,
            SynthesizeAdvancedRunner,
            DecomposeRunner,
            DecomposeAdvancedRunner,
            InvestigateRunner,
            InvestigateAdvancedRunner,
            ValidateRunner,
            ValidateAdvancedRunner,
            RecommendRunner,
            RecommendAdvancedRunner,
        ]

        for runner_class in runners:
            RunnerRegistry.register(runner_class)

        logger.info("core_runners_registered", count=len(runners))
    except ImportError as exc:
        logger.warning("core_runners_import_failed", error=str(exc))


# Singleton instance
runner_registry = RunnerRegistry()
