"""
State Reducers for LangGraph Parallel Execution.

When LangGraph nodes run in parallel (fan-out pattern), their outputs
need to be merged back into the shared state. Without proper reducers,
later writes overwrite earlier ones, causing data loss.

This module provides:
- Standard reducer functions for common patterns
- Operator-based reducers for use in TypedDict annotations
- Custom reducer composition utilities

Usage with LangGraph StateGraph:
    from typing import Annotated
    from core.reducers import append_list, merge_dicts

    class AgentState(TypedDict):
        messages: Annotated[List[str], append_list]
        results: Annotated[Dict[str, Any], merge_dicts]
        sources: Annotated[List[Source], append_list]

    graph = StateGraph(AgentState)
"""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Union
from datetime import datetime
from functools import reduce as functools_reduce
from operator import add
import copy
import structlog

logger = structlog.get_logger()

T = TypeVar("T")


# ============================================================================
# Core Reducer Functions
# ============================================================================

def append_list(left: List[T], right: List[T]) -> List[T]:
    """
    Append items from right list to left list.

    Use when parallel nodes each produce items that should all be collected.

    Example:
        Node A produces: ["source1", "source2"]
        Node B produces: ["source3"]
        Result: ["source1", "source2", "source3"]
    """
    if left is None:
        return right or []
    if right is None:
        return left
    return left + right


def prepend_list(left: List[T], right: List[T]) -> List[T]:
    """
    Prepend items from right list to left list.

    Use when newer items should appear first (e.g., activity feed).
    """
    if left is None:
        return right or []
    if right is None:
        return left
    return right + left


def unique_append_list(left: List[T], right: List[T]) -> List[T]:
    """
    Append only unique items (deduplication by value).

    Use when parallel nodes might produce duplicates.
    """
    if left is None:
        return right or []
    if right is None:
        return left

    result = list(left)
    seen = set(left) if all(isinstance(x, (str, int, float)) for x in left) else None

    for item in right:
        if seen is not None:
            if item not in seen:
                result.append(item)
                seen.add(item)
        else:
            if item not in result:
                result.append(item)

    return result


def merge_dicts(left: Dict[str, Any], right: Dict[str, Any]) -> Dict[str, Any]:
    """
    Shallow merge dictionaries (right overwrites left on conflicts).

    Use when parallel nodes produce different key-value pairs.

    Example:
        Node A produces: {"a": 1, "b": 2}
        Node B produces: {"c": 3, "b": 10}
        Result: {"a": 1, "b": 10, "c": 3}
    """
    if left is None:
        return right or {}
    if right is None:
        return left
    return {**left, **right}


def deep_merge_dicts(left: Dict[str, Any], right: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deep merge nested dictionaries recursively.

    Use when parallel nodes update different parts of nested structures.
    """
    if left is None:
        return copy.deepcopy(right) if right else {}
    if right is None:
        return copy.deepcopy(left)

    result = copy.deepcopy(left)
    for key, value in right.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = copy.deepcopy(value)

    return result


def take_latest(left: T, right: T) -> T:
    """
    Always take the right (latest) value.

    This is the default behavior without a reducer, but explicit
    annotation makes the intent clear.
    """
    return right if right is not None else left


def take_first(left: T, right: T) -> T:
    """
    Always keep the left (first) value, ignore subsequent writes.

    Use when the first result should be preserved (e.g., creation timestamp).
    """
    return left if left is not None else right


def coalesce(left: T, right: T) -> T:
    """
    Take the first non-None value.

    Use when any node can provide the value, and we want the first available.
    """
    return left if left is not None else right


# ============================================================================
# Numeric Reducers
# ============================================================================

def sum_values(left: Union[int, float], right: Union[int, float]) -> Union[int, float]:
    """
    Sum numeric values from parallel branches.

    Use for: token counts, costs, scores that should be totaled.
    """
    return (left or 0) + (right or 0)


def max_value(left: Union[int, float], right: Union[int, float]) -> Union[int, float]:
    """
    Take the maximum value.

    Use for: highest confidence score, latest timestamp.
    """
    if left is None:
        return right
    if right is None:
        return left
    return max(left, right)


def min_value(left: Union[int, float], right: Union[int, float]) -> Union[int, float]:
    """
    Take the minimum value.

    Use for: earliest timestamp, lowest error count.
    """
    if left is None:
        return right
    if right is None:
        return left
    return min(left, right)


def average_values(left: Union[int, float, None], right: Union[int, float, None]) -> float:
    """
    Average numeric values (simple mean of two values).

    Note: For proper averaging of multiple values, use aggregate_scores.
    """
    if left is None and right is None:
        return 0.0
    if left is None:
        return float(right)
    if right is None:
        return float(left)
    return (float(left) + float(right)) / 2


# ============================================================================
# Complex Reducers for Domain Objects
# ============================================================================

def merge_messages(left: List[Dict], right: List[Dict]) -> List[Dict]:
    """
    Merge message lists, preserving order by timestamp if available.

    Use for: conversation history from parallel agent interactions.
    """
    if left is None:
        return right or []
    if right is None:
        return left

    combined = left + right

    # Sort by timestamp if present, otherwise preserve append order
    if combined and "timestamp" in combined[0]:
        combined.sort(key=lambda m: m.get("timestamp", ""))

    return combined


def merge_sources(left: List[Dict], right: List[Dict]) -> List[Dict]:
    """
    Merge source/citation lists, deduplicating by URL or ID.

    Use for: research results from parallel search agents.
    """
    if left is None:
        return right or []
    if right is None:
        return left

    seen_ids = set()
    result = []

    for source in left + right:
        # Deduplicate by id, url, or title
        source_id = source.get("id") or source.get("url") or source.get("title")
        if source_id and source_id not in seen_ids:
            result.append(source)
            seen_ids.add(source_id)
        elif not source_id:
            result.append(source)

    return result


def merge_artifacts(left: List[Dict], right: List[Dict]) -> List[Dict]:
    """
    Merge artifact lists, deduplicating by artifact_id.

    Use for: documents, charts, files from parallel generation nodes.
    """
    if left is None:
        return right or []
    if right is None:
        return left

    seen_ids = set()
    result = []

    for artifact in left + right:
        artifact_id = artifact.get("artifact_id") or artifact.get("id")
        if artifact_id and artifact_id not in seen_ids:
            result.append(artifact)
            seen_ids.add(artifact_id)
        elif not artifact_id:
            result.append(artifact)

    return result


def aggregate_scores(
    left: Optional[Dict[str, float]],
    right: Optional[Dict[str, float]]
) -> Dict[str, float]:
    """
    Aggregate quality scores from parallel evaluations.

    Averages scores for the same dimension, preserves unique dimensions.

    Example:
        Node A: {"accuracy": 0.9, "completeness": 0.8}
        Node B: {"accuracy": 0.95, "relevance": 0.85}
        Result: {"accuracy": 0.925, "completeness": 0.8, "relevance": 0.85}
    """
    if left is None:
        return right or {}
    if right is None:
        return left

    result = dict(left)
    for key, value in right.items():
        if key in result:
            result[key] = (result[key] + value) / 2
        else:
            result[key] = value

    return result


def merge_errors(left: List[str], right: List[str]) -> List[str]:
    """
    Merge error lists, keeping unique errors only.

    Use for: collecting errors from parallel operations.
    """
    if left is None:
        return right or []
    if right is None:
        return left

    return list(set(left + right))


# ============================================================================
# Token/Cost Tracking Reducers
# ============================================================================

def sum_token_usage(
    left: Optional[Dict[str, int]],
    right: Optional[Dict[str, int]]
) -> Dict[str, int]:
    """
    Sum token usage from parallel LLM calls.

    Expected format: {"prompt_tokens": X, "completion_tokens": Y, "total_tokens": Z}
    """
    if left is None:
        return right or {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    if right is None:
        return left

    return {
        "prompt_tokens": (left.get("prompt_tokens", 0) + right.get("prompt_tokens", 0)),
        "completion_tokens": (left.get("completion_tokens", 0) + right.get("completion_tokens", 0)),
        "total_tokens": (left.get("total_tokens", 0) + right.get("total_tokens", 0)),
    }


def sum_costs(
    left: Optional[Dict[str, float]],
    right: Optional[Dict[str, float]]
) -> Dict[str, float]:
    """
    Sum costs from parallel operations.

    Expected format: {"llm_cost": X, "api_cost": Y, "total_cost": Z}
    """
    if left is None:
        return right or {"llm_cost": 0.0, "api_cost": 0.0, "total_cost": 0.0}
    if right is None:
        return left

    return {
        "llm_cost": (left.get("llm_cost", 0.0) + right.get("llm_cost", 0.0)),
        "api_cost": (left.get("api_cost", 0.0) + right.get("api_cost", 0.0)),
        "total_cost": (left.get("total_cost", 0.0) + right.get("total_cost", 0.0)),
    }


# ============================================================================
# Reducer Composition Utilities
# ============================================================================

def create_list_reducer(
    key_fn: Optional[Callable[[T], Any]] = None,
    deduplicate: bool = False
) -> Callable[[List[T], List[T]], List[T]]:
    """
    Create a custom list reducer with optional deduplication.

    Args:
        key_fn: Function to extract key for deduplication (e.g., lambda x: x["id"])
        deduplicate: Whether to remove duplicates
    """
    def reducer(left: List[T], right: List[T]) -> List[T]:
        if left is None:
            return right or []
        if right is None:
            return left

        if not deduplicate:
            return left + right

        if key_fn:
            seen = {key_fn(item) for item in left if key_fn(item) is not None}
            result = list(left)
            for item in right:
                key = key_fn(item)
                if key is None or key not in seen:
                    result.append(item)
                    if key is not None:
                        seen.add(key)
            return result
        else:
            return unique_append_list(left, right)

    return reducer


def create_dict_reducer(
    merge_strategy: str = "shallow",
    conflict_resolution: str = "right_wins"
) -> Callable[[Dict, Dict], Dict]:
    """
    Create a custom dict reducer with configurable merge strategy.

    Args:
        merge_strategy: "shallow" or "deep"
        conflict_resolution: "right_wins", "left_wins", or "merge" (for lists/dicts)
    """
    def reducer(left: Dict, right: Dict) -> Dict:
        if left is None:
            return right or {}
        if right is None:
            return left

        if merge_strategy == "shallow":
            if conflict_resolution == "left_wins":
                return {**right, **left}
            else:
                return {**left, **right}
        else:
            return deep_merge_dicts(left, right)

    return reducer


# ============================================================================
# Annotated Type Helpers
# ============================================================================

# Pre-built annotated types for common patterns
# Usage: messages: Annotated[List[str], operator.add]

# For lists that should be concatenated
ListAppend = append_list

# For dicts that should be merged
DictMerge = merge_dicts

# For values where latest wins
Latest = take_latest

# For values where first wins
First = take_first

# For numeric sums
NumericSum = sum_values

# For token tracking
TokenSum = sum_token_usage

# For cost tracking
CostSum = sum_costs


# ============================================================================
# LangGraph State Examples
# ============================================================================

"""
Example state definitions using these reducers:

from typing import Annotated, List, Dict, Any, TypedDict
from core.reducers import (
    append_list, merge_dicts, sum_token_usage, sum_costs,
    merge_sources, merge_artifacts, aggregate_scores
)

class MissionState(TypedDict):
    # Input (no reducer needed - set once at start)
    goal: str
    user_id: str
    session_id: str

    # Messages accumulate from all nodes
    messages: Annotated[List[Dict], append_list]

    # Research sources merge from parallel searches
    sources: Annotated[List[Dict], merge_sources]

    # Artifacts collect from parallel generation
    artifacts: Annotated[List[Dict], merge_artifacts]

    # Quality scores average across evaluations
    quality_scores: Annotated[Dict[str, float], aggregate_scores]

    # Token usage sums across all LLM calls
    token_usage: Annotated[Dict[str, int], sum_token_usage]

    # Costs sum across all operations
    costs: Annotated[Dict[str, float], sum_costs]

    # Results merge from parallel workers
    results: Annotated[Dict[str, Any], merge_dicts]

    # Final output (last write wins)
    output: str

    # Errors collect from any node
    errors: Annotated[List[str], merge_errors]
"""
