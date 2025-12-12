"""
Parallel Execution Patterns for LangGraph Workflows.

Production-grade utilities for:
- Fan-out/fan-in patterns (parallel branches)
- Concurrent task execution with limits
- Semaphore-based rate limiting
- Timeout handling for parallel operations
- Graceful degradation when branches fail

This module provides patterns for Mode 3 (Deep Research) and Mode 4
where multiple sub-tasks (RAG, web search, analysis) run in parallel.

Usage with LangGraph:
    from core.parallel import parallel_branch, fan_out_fan_in

    # Run RAG and web search in parallel
    results = await fan_out_fan_in(
        {"rag": rag_search(query), "web": web_search(query)},
        timeout=30.0
    )
"""

from typing import (
    Any, Awaitable, Callable, Dict, List, Optional, Set, Tuple, TypeVar, Union
)
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import asyncio
import time
import structlog

logger = structlog.get_logger()

T = TypeVar("T")
R = TypeVar("R")


# ============================================================================
# Parallel Execution Configuration
# ============================================================================

@dataclass
class ParallelConfig:
    """Configuration for parallel execution."""
    # Maximum concurrent tasks
    max_concurrency: int = 10

    # Default timeout for individual tasks (seconds)
    default_timeout: float = 30.0

    # Overall timeout for fan-out operation (seconds)
    overall_timeout: float = 120.0

    # Minimum successful branches required (0 = all must succeed)
    min_success_required: int = 0

    # Whether to cancel remaining tasks when min_success reached
    cancel_on_min_success: bool = False

    # Whether to include partial results on timeout
    include_partial_on_timeout: bool = True

    # Retry failed branches
    retry_failed: bool = False
    max_retries: int = 2
    retry_delay: float = 1.0


DEFAULT_PARALLEL_CONFIG = ParallelConfig()


# ============================================================================
# Execution Results
# ============================================================================

class BranchStatus(str, Enum):
    """Status of a parallel branch."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


@dataclass
class BranchResult:
    """Result from a single parallel branch."""
    branch_id: str
    status: BranchStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    duration_ms: float = 0.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    retries: int = 0


@dataclass
class ParallelResult:
    """Combined results from parallel execution."""
    results: Dict[str, BranchResult]
    successful: Dict[str, Any]
    failed: Dict[str, str]
    total_duration_ms: float
    started_at: datetime
    completed_at: datetime

    @property
    def success_count(self) -> int:
        return len(self.successful)

    @property
    def failure_count(self) -> int:
        return len(self.failed)

    @property
    def all_succeeded(self) -> bool:
        return self.failure_count == 0

    def get(self, branch_id: str, default: Any = None) -> Any:
        """Get result from a specific branch."""
        return self.successful.get(branch_id, default)


# ============================================================================
# Core Parallel Execution
# ============================================================================

class ParallelExecutor:
    """
    Parallel task executor with concurrency control.

    Features:
    - Semaphore-based concurrency limiting
    - Per-task and overall timeouts
    - Graceful cancellation
    - Partial result collection
    """

    def __init__(self, config: Optional[ParallelConfig] = None):
        self.config = config or DEFAULT_PARALLEL_CONFIG
        self._semaphore: Optional[asyncio.Semaphore] = None
        self._active_tasks: Set[asyncio.Task] = set()

    async def execute(
        self,
        tasks: Dict[str, Awaitable[T]],
        timeout: Optional[float] = None,
        min_success: Optional[int] = None,
    ) -> ParallelResult:
        """
        Execute tasks in parallel with concurrency control.

        Args:
            tasks: Dictionary mapping branch_id to coroutine
            timeout: Overall timeout (uses config default if None)
            min_success: Minimum successful branches required

        Returns:
            ParallelResult with all branch results
        """
        if not tasks:
            now = datetime.utcnow()
            return ParallelResult(
                results={},
                successful={},
                failed={},
                total_duration_ms=0,
                started_at=now,
                completed_at=now,
            )

        timeout = timeout or self.config.overall_timeout
        min_success = min_success if min_success is not None else self.config.min_success_required

        # Create semaphore for concurrency control
        self._semaphore = asyncio.Semaphore(self.config.max_concurrency)

        started_at = datetime.utcnow()
        start_time = time.perf_counter()

        results: Dict[str, BranchResult] = {}
        successful: Dict[str, Any] = {}
        failed: Dict[str, str] = {}

        # Wrap each task with semaphore and timeout
        async def run_branch(branch_id: str, coro: Awaitable[T]) -> BranchResult:
            branch_started = datetime.utcnow()
            branch_start = time.perf_counter()

            try:
                async with self._semaphore:
                    result = await asyncio.wait_for(
                        coro,
                        timeout=self.config.default_timeout
                    )

                    return BranchResult(
                        branch_id=branch_id,
                        status=BranchStatus.SUCCESS,
                        result=result,
                        duration_ms=(time.perf_counter() - branch_start) * 1000,
                        started_at=branch_started,
                        completed_at=datetime.utcnow(),
                    )

            except asyncio.TimeoutError:
                return BranchResult(
                    branch_id=branch_id,
                    status=BranchStatus.TIMEOUT,
                    error=f"Branch timed out after {self.config.default_timeout}s",
                    duration_ms=(time.perf_counter() - branch_start) * 1000,
                    started_at=branch_started,
                    completed_at=datetime.utcnow(),
                )

            except asyncio.CancelledError:
                return BranchResult(
                    branch_id=branch_id,
                    status=BranchStatus.CANCELLED,
                    error="Branch was cancelled",
                    duration_ms=(time.perf_counter() - branch_start) * 1000,
                    started_at=branch_started,
                    completed_at=datetime.utcnow(),
                )

            except Exception as e:
                logger.error(
                    "parallel_branch_failed",
                    branch_id=branch_id,
                    error=str(e),
                    exc_info=True
                )
                return BranchResult(
                    branch_id=branch_id,
                    status=BranchStatus.FAILED,
                    error=str(e),
                    duration_ms=(time.perf_counter() - branch_start) * 1000,
                    started_at=branch_started,
                    completed_at=datetime.utcnow(),
                )

        # Create tasks
        branch_tasks = {
            branch_id: asyncio.create_task(run_branch(branch_id, coro))
            for branch_id, coro in tasks.items()
        }
        self._active_tasks = set(branch_tasks.values())

        try:
            # Wait with overall timeout
            done, pending = await asyncio.wait(
                branch_tasks.values(),
                timeout=timeout,
                return_when=asyncio.ALL_COMPLETED
            )

            # Cancel any pending tasks (shouldn't happen with ALL_COMPLETED)
            for task in pending:
                task.cancel()

            # Collect results
            for branch_id, task in branch_tasks.items():
                if task in done:
                    try:
                        branch_result = task.result()
                        results[branch_id] = branch_result

                        if branch_result.status == BranchStatus.SUCCESS:
                            successful[branch_id] = branch_result.result
                        else:
                            failed[branch_id] = branch_result.error or "Unknown error"
                    except Exception as e:
                        results[branch_id] = BranchResult(
                            branch_id=branch_id,
                            status=BranchStatus.FAILED,
                            error=str(e),
                        )
                        failed[branch_id] = str(e)
                else:
                    # Task was pending (timed out)
                    results[branch_id] = BranchResult(
                        branch_id=branch_id,
                        status=BranchStatus.TIMEOUT,
                        error=f"Overall timeout after {timeout}s",
                    )
                    failed[branch_id] = f"Overall timeout after {timeout}s"

        except asyncio.CancelledError:
            # Entire operation cancelled - cancel all branches
            for task in branch_tasks.values():
                task.cancel()
            raise

        finally:
            self._active_tasks.clear()

        completed_at = datetime.utcnow()
        total_duration_ms = (time.perf_counter() - start_time) * 1000

        # Log summary
        logger.info(
            "parallel_execution_complete",
            total_branches=len(tasks),
            successful=len(successful),
            failed=len(failed),
            duration_ms=total_duration_ms,
        )

        return ParallelResult(
            results=results,
            successful=successful,
            failed=failed,
            total_duration_ms=total_duration_ms,
            started_at=started_at,
            completed_at=completed_at,
        )

    async def cancel_all(self):
        """Cancel all active tasks."""
        for task in self._active_tasks:
            task.cancel()
        self._active_tasks.clear()


# ============================================================================
# Convenience Functions
# ============================================================================

async def fan_out_fan_in(
    tasks: Dict[str, Awaitable[T]],
    timeout: float = 60.0,
    max_concurrency: int = 10,
    min_success: int = 0,
) -> ParallelResult:
    """
    Execute multiple coroutines in parallel and collect results.

    This is the most common pattern for Mode 3 deep research:
    - Fan-out: Start RAG, web search, and analysis in parallel
    - Fan-in: Collect and merge all results

    Args:
        tasks: Dict mapping task names to coroutines
        timeout: Overall timeout in seconds
        max_concurrency: Maximum concurrent tasks
        min_success: Minimum tasks that must succeed (0 = all)

    Returns:
        ParallelResult with all task outcomes

    Example:
        results = await fan_out_fan_in({
            "rag": rag_search(query),
            "web": web_search(query),
            "pubmed": pubmed_search(query),
        }, timeout=30.0)

        if results.all_succeeded:
            # Merge all sources
            sources = results.successful["rag"] + results.successful["web"]
    """
    config = ParallelConfig(
        max_concurrency=max_concurrency,
        overall_timeout=timeout,
        min_success_required=min_success,
    )
    executor = ParallelExecutor(config)
    return await executor.execute(tasks, timeout=timeout, min_success=min_success)


async def parallel_map(
    items: List[T],
    func: Callable[[T], Awaitable[R]],
    max_concurrency: int = 10,
    timeout: float = 60.0,
) -> List[Tuple[T, Optional[R], Optional[str]]]:
    """
    Apply async function to items in parallel.

    Returns list of (item, result, error) tuples.

    Example:
        async def fetch_agent(agent_id):
            return await db.get_agent(agent_id)

        results = await parallel_map(
            agent_ids,
            fetch_agent,
            max_concurrency=5
        )
    """
    if not items:
        return []

    tasks = {
        str(i): func(item)
        for i, item in enumerate(items)
    }

    result = await fan_out_fan_in(
        tasks,
        timeout=timeout,
        max_concurrency=max_concurrency,
    )

    return [
        (
            items[int(branch_id)],
            result.successful.get(branch_id),
            result.failed.get(branch_id)
        )
        for branch_id in sorted(tasks.keys(), key=int)
    ]


async def run_with_fallback(
    primary: Awaitable[T],
    fallback: Awaitable[T],
    timeout: float = 30.0,
) -> Tuple[T, str]:
    """
    Run primary task, fall back to secondary on failure.

    Returns (result, source) where source is "primary" or "fallback".

    Example:
        result, source = await run_with_fallback(
            openai_call(prompt),
            anthropic_call(prompt),
            timeout=30.0
        )
    """
    try:
        result = await asyncio.wait_for(primary, timeout=timeout)
        return (result, "primary")
    except Exception as e:
        logger.warning(
            "primary_failed_using_fallback",
            error=str(e)
        )
        try:
            result = await asyncio.wait_for(fallback, timeout=timeout)
            return (result, "fallback")
        except Exception as fallback_error:
            raise RuntimeError(
                f"Both primary and fallback failed. "
                f"Primary: {e}, Fallback: {fallback_error}"
            )


async def race(
    tasks: Dict[str, Awaitable[T]],
    timeout: float = 30.0,
) -> Tuple[str, T]:
    """
    Return the first successful result from multiple tasks.

    Cancels remaining tasks once one succeeds.

    Returns (winner_id, result).

    Example:
        winner, result = await race({
            "openai": openai_call(prompt),
            "anthropic": anthropic_call(prompt),
        })
    """
    if not tasks:
        raise ValueError("No tasks provided to race")

    async def wrap_task(task_id: str, coro: Awaitable[T]) -> Tuple[str, T]:
        result = await coro
        return (task_id, result)

    wrapped = [
        asyncio.create_task(wrap_task(task_id, coro))
        for task_id, coro in tasks.items()
    ]

    try:
        done, pending = await asyncio.wait(
            wrapped,
            timeout=timeout,
            return_when=asyncio.FIRST_COMPLETED
        )

        # Cancel remaining tasks
        for task in pending:
            task.cancel()

        if not done:
            raise asyncio.TimeoutError(f"All tasks timed out after {timeout}s")

        # Return first completed (successful)
        for task in done:
            try:
                task_id, result = task.result()
                return (task_id, result)
            except Exception:
                continue

        # All completed tasks failed
        errors = []
        for task in done:
            try:
                task.result()
            except Exception as e:
                errors.append(str(e))

        raise RuntimeError(f"All tasks failed: {'; '.join(errors)}")

    except asyncio.CancelledError:
        for task in wrapped:
            task.cancel()
        raise


# ============================================================================
# LangGraph Integration Helpers
# ============================================================================

@dataclass
class BranchDefinition:
    """Definition for a parallel branch in LangGraph."""
    node_name: str
    condition: Optional[Callable[[Any], bool]] = None
    priority: int = 0
    timeout: float = 30.0


def create_parallel_branches(
    branches: List[BranchDefinition],
    state: Any,
) -> Dict[str, bool]:
    """
    Determine which branches to execute based on state.

    Used in LangGraph conditional edges for fan-out.

    Example:
        branches = [
            BranchDefinition("rag_search", condition=lambda s: s.enable_rag),
            BranchDefinition("web_search", condition=lambda s: s.enable_web_search),
            BranchDefinition("pubmed_search"),  # Always runs
        ]

        active = create_parallel_branches(branches, state)
        # Returns: {"rag_search": True, "web_search": False, "pubmed_search": True}
    """
    result = {}
    for branch in branches:
        if branch.condition is None:
            result[branch.node_name] = True
        else:
            try:
                result[branch.node_name] = branch.condition(state)
            except Exception as e:
                logger.warning(
                    "branch_condition_error",
                    branch=branch.node_name,
                    error=str(e)
                )
                result[branch.node_name] = False

    return result


class ParallelBranchRouter:
    """
    Router for conditional fan-out in LangGraph.

    Usage:
        router = ParallelBranchRouter([
            ("rag_node", lambda s: s.get("enable_rag", True)),
            ("web_node", lambda s: s.get("enable_web", False)),
            ("analysis_node", None),  # Always runs
        ])

        graph.add_conditional_edges(
            "start",
            router.route,
            router.branch_map
        )
    """

    def __init__(
        self,
        branches: List[Tuple[str, Optional[Callable[[Any], bool]]]],
        default: str = "end",
    ):
        self.branches = branches
        self.default = default
        self.branch_map = {name: name for name, _ in branches}
        self.branch_map[default] = default

    def route(self, state: Any) -> List[str]:
        """
        Determine active branches based on state.

        Returns list of branch names to execute.
        """
        active = []
        for name, condition in self.branches:
            if condition is None:
                active.append(name)
            else:
                try:
                    if condition(state):
                        active.append(name)
                except Exception as e:
                    logger.warning(
                        "branch_routing_error",
                        branch=name,
                        error=str(e)
                    )

        return active if active else [self.default]


# ============================================================================
# Semaphore Pool for Rate Limiting
# ============================================================================

class SemaphorePool:
    """
    Pool of named semaphores for rate limiting different resources.

    Example:
        pool = SemaphorePool()
        pool.set_limit("openai", 10)
        pool.set_limit("pubmed", 3)

        async with pool.acquire("openai"):
            await openai_call()
    """

    def __init__(self):
        self._semaphores: Dict[str, asyncio.Semaphore] = {}
        self._limits: Dict[str, int] = {}

    def set_limit(self, name: str, limit: int):
        """Set concurrency limit for a named resource."""
        self._limits[name] = limit
        self._semaphores[name] = asyncio.Semaphore(limit)

    def get_semaphore(self, name: str) -> asyncio.Semaphore:
        """Get semaphore for a named resource."""
        if name not in self._semaphores:
            # Default to 10 concurrent
            self.set_limit(name, 10)
        return self._semaphores[name]

    def acquire(self, name: str) -> asyncio.Semaphore:
        """Context manager to acquire semaphore."""
        return self.get_semaphore(name)


# Global semaphore pool
_semaphore_pool: Optional[SemaphorePool] = None


def get_semaphore_pool() -> SemaphorePool:
    """Get global semaphore pool."""
    global _semaphore_pool
    if _semaphore_pool is None:
        _semaphore_pool = SemaphorePool()
        # Set default limits
        _semaphore_pool.set_limit("openai", 10)
        _semaphore_pool.set_limit("anthropic", 10)
        _semaphore_pool.set_limit("pubmed", 3)
        _semaphore_pool.set_limit("tavily", 5)
        _semaphore_pool.set_limit("database", 20)
    return _semaphore_pool


def reset_semaphore_pool():
    """Reset global semaphore pool (for testing)."""
    global _semaphore_pool
    _semaphore_pool = None


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Configuration
    "ParallelConfig",
    "DEFAULT_PARALLEL_CONFIG",

    # Results
    "BranchStatus",
    "BranchResult",
    "ParallelResult",

    # Core executor
    "ParallelExecutor",

    # Convenience functions
    "fan_out_fan_in",
    "parallel_map",
    "run_with_fallback",
    "race",

    # LangGraph integration
    "BranchDefinition",
    "create_parallel_branches",
    "ParallelBranchRouter",

    # Rate limiting
    "SemaphorePool",
    "get_semaphore_pool",
    "reset_semaphore_pool",
]
